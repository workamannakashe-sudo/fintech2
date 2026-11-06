# BudgetMitra — System Architecture & Data Security

## Architectural Overview

BudgetMitra is engineered around an **Offline-First, Zero-Telemetry** paradigm.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BudgetMitra Presentation                        │
├────────────────────────────────────────────────────────────────────────┤
│  UI Layer (React 19 + Tailwind v4 + M3 Glassmorphism + Lucide Icons)   │
│  - Multilingual Core (English, हिन्दी, मराठी)                         │
│  - Responsive Viewports (375px mobile up to 1440px desktop)            │
│  - Mobile Bottom Navigation Bar & Desktop Sidebar Rail                 │
├────────────────────────────────────────────────────────────────────────┤
│  Application & Financial Intelligence Engines                          │
│  ┌───────────────────────┬─────────────────────────┬─────────────────┐ │
│  │ Health Score (0-100)  │ SMS Debit Parser Engine │ Afford Simulator│ │
│  ├───────────────────────┼─────────────────────────┼─────────────────┤ │
│  │ Loan & EMI Payoffs    │ Split Bill & UPI Gen    │ Scheme Matcher  │ │
│  └───────────────────────┴─────────────────────────┴─────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  Data Layer (100% On-Device Persistence)                               │
│  ┌──────────────────────────────────┬────────────────────────────────┐ │
│  │ SQLite / LocalStorage Engine     │ Backup & Restore JSON Engine   │ │
│  │ Versioned Schema Migrations (v1) │ Safe input sanitization        │ │
│  └──────────────────────────────────┴────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  Android Platform & Hardware Bridge                                    │
│  ┌──────────────────────────────────┬────────────────────────────────┐ │
│  │ SmsReaderPlugin (Java)           │ FileProvider (PDF bill attach) │ │
│  ├──────────────────────────────────┼────────────────────────────────┤ │
│  │ WhatsApp Deep-Link Intents       │ Local Notification Scheduler   │ │
│  └──────────────────────────────────┴────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Zero Cloud Data Policy
- **No Supabase / Remote DB**: Supabase was omitted per instructions; all tables reside strictly in local storage.
- **No Analytics / Telemetry**: No tracking scripts, analytics SDKs, or background pings exist.
- **Network Permissions**: `INTERNET` and `ACCESS_NETWORK_STATE` are used exclusively for handling deep-links to WhatsApp (`whatsapp://`) and UPI apps (`upi://pay`).

---

## 2. On-Device SMS Detection & Parsing
1. **Security**: SMS messages are read directly via Android `ContentResolver` querying `Telephony.Sms.Inbox.CONTENT_URI`.
2. **Filtering Pipeline**:
   - Discards OTPs using regex patterns `/(?:otp|one time password|verification code)/i`.
   - Discards credits using regex `/(?:credited|deposited|salary credited|refund received)/i`.
   - Discards failed / declined payments.
   - Extracts amount via currency pattern `(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)`.
   - Extracts merchant name and bank handle.
   - Computes deterministic hash `sms_{hash}` and stores in `sms_imported` table to prevent duplicates.

---

## 3. Database Schema (Version 1)
- `profile`: Student details (name, course, allowance, UPI ID, PIN hash).
- `transactions`: Logged student debits and credits with category and anomaly flags.
- `budgets`: Category envelopes and caps.
- `savings_goals`: Target goal records with progress.
- `loans`: Principal, interest, and payoff simulations.
- `sms_imported`: Audit table with deduplication hashes and raw snippets.
- `gamification`: XP, streaks, unlocked badges, and 90-day activity map.
