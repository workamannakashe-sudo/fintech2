# BudgetMitra — Offline-First Student Money Manager

An offline-first, privacy-focused financial companion built specifically for Indian college students. It provides automated on-device SMS expense tracking, financial health scoring, envelope budgeting, bill splitting with WhatsApp and UPI deep-links, loan payoff simulation, and Indian government scholarship matching — operating with zero cloud telemetry and 100% on-device data sovereignty.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction adheres strictly to the offline-only and privacy-first mandate. Based on your clarifying choices, the implementation will integrate the following verified parameters:

- **Confirmed Decision 1 (Demo Persona)**: Pre-configured **Engineering Hosteller** profile (₹6,500/month allowance, campus hostel & mess dues, stationery & academic expenses, local transit, and weekend canteen habits) available via a single-tap "Demo Student" onboarding shortcut.
- **Confirmed Decision 2 (SMS Sync Workflow)**: **Automatic background sync on app launch** with non-intrusive badge counts on the navigation bar, catching up on new bank/UPI debit messages and providing a dedicated review and one-tap undo screen.
- **Confirmed Decision 3 (Security & App Lock)**: **Open access by default** with toggleable 4-digit PIN lock and biometric authentication (fingerprint/face) available in the Settings menu, encrypting user preferences and safeguarding sensitive balance data locally.
- **Confirmed Decision 4 (Zero-Telemetry Data Storage)**: All database operations persist exclusively to an on-device SQLite database via `@capacitor-community/sqlite` on Android and an IndexedDB/Dexie fallback in standard web browsers. No Supabase, no external endpoints, no remote tracking.
- **Confirmed Decision 5 (Android Native & Capacitor Bridge)**: Configured with `appId: com.budgetmitra.app`, minSdk 24, targetSdk 35+, Java-based native SMS listener & query plugin, FileProvider setup for receipt/bill PDF sharing to WhatsApp, and an automated GitHub Actions APK generation workflow.

---

## 1. Overview & Core Concept

- **What It Does**: BudgetMitra tracks day-to-day student finances in Indian Rupees (₹), automatically parsing debit SMS alerts from major Indian banks and UPI handles (SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, BoB, Paytm, PhonePe, and generic UPI strings). It provides instant afford-it evaluations ("Can I afford this?"), peer bill splitting with direct WhatsApp payment requests, EMI/loan calculations, scheme discovery, and gamified streak rewards.
- **Target Audience / Persona**: College and university students across India navigating hostel life, PG rents, mess food, campus clubs, exam fees, and tight monthly allowances.
- **Key Value**: 100% private, works completely without internet connectivity, eliminates tedious manual receipt entry through intelligent SMS parsing, and delivers multilingual financial clarity in English, Hindi, and Marathi.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **First-Launch & Onboarding**:
   - Welcome splash with language selector (English, हिन्दी, मराठी).
   - Mode choice: "Quick Start as Demo Student" (Engineering Hosteller pre-filled), "Guest Mode", or "Set Up My Profile" (Course, Year, State, Allowance, Category).
   - Transparent, step-by-step Permissions Explainer (SMS read/receive, Camera for receipts, Notifications for streaks, Storage/Media for bill exports) with individual grant triggers.
2. **Dashboard & Financial Health**:
   - Total balance, monthly burn-rate gauge, and Financial Health Score (0–100, Grade A+ to D) derived from 4 weighted pillars: Savings Rate, Budget Adherence, Anomaly Risk, and Logging Consistency.
   - Daily rule-based contextual advice chip (e.g., *"You've used 65% of your food budget with 14 days remaining in the month"*).
   - Quick-log preset action chips (Chai/Snacks ₹20, Canteen Lunch ₹80, Auto/Metro ₹40, Xerox/Prints ₹50).
3. **Automated SMS & Statement Tracker**:
   - Launch catch-up banner displaying newly detected bank/UPI debits.
   - Detailed SMS inbox with filtering by bank, date range (Past 7 / 30 / 90 days), and one-tap Undo.
   - Statement upload modal supporting CSV, pasted SMS batches, and PDF bank statements (with password-unlock prompt for DOB/PAN formats).
4. **"Can I Afford This?" Decision Engine**:
   - Interactive prompt asking for item price and category.
   - Outputs a clear verdict: `YES` (Green), `CAUTION` (Amber), or `NO` (Rose) with a confidence score, projected monthly balance impact, and impact on target savings goals. Available across all 3 languages.
5. **Split the Bill & WhatsApp Pay**:
   - Add expense item or scan receipt image with line-item extraction.
   - Select friends, assign equal or custom percentage splits with exact paisa rounding.
   - One-tap WhatsApp deep link sending itemized breakdown and personalized `upi://pay` links, or generating a shareable PDF invoice via FileProvider.
6. **Budget Planner & Goal Envelope**:
   - Monthly category envelopes with visual progress bars, velocity tracking, and projected budget exhaustion dates.
   - Interactive what-if burn-rate slider showing how reducing canteen or shopping expenses extends survival days.
7. **Scholarship & Scheme Discovery**:
   - Instant matching engine filtering central, state, and private student schemes (PMSS, Post-Matric OBC, Tata, CSSS, Vidya Lakshmi, Bihar Student Credit Card, AICTE Pragati, MYSY Gujarat).
   - Strong/Likely/Possible match classification with eligibility checklist and official application portals.
8. **Settings & Data Management**:
   - Complete JSON Export / Import (Backup & Restore) via the native share sheet or download.
   - App Lock (PIN / Biometrics) configuration, UPI VPA configuration, language toggle, and "Delete All Data" with double-confirmation dialog.

### Visual Identity & Theme
- **Style**: Contemporary Glassmorphism with crisp Material 3 micro-interactions and tactile card lifts.
- **Color Palette**:
  - Background Canvas: `#F8F9FA` (Light) / `#0F172A` (Dark)
  - Surface Cards: Pure white `#FFFFFF` with `rgba(226, 232, 240, 0.8)` borders (Light) / `#1E293B` with `rgba(51, 65, 85, 0.6)` borders (Dark)
  - Primary Teal: `#0F766E` (Deep Teal) / `#0D9488` (Vibrant Teal)
  - Accent Amber: `#F59E0B` (Warning/Urgency)
  - Status Indicators: Success Emerald `#10B981`, Caution Orange `#F97316`, Danger Rose `#F43F5E`
- **Typography**: `Outfit` for numerical counters, grades, and headers; `Plus Jakarta Sans` for body copy and financial tables.
- **Navigation**: Clean mobile bottom navigation bar with active teal pill indicators; responsive desktop navigation rail when viewed on larger viewports.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Layer Database Architecture**:
  - *Approach*: `@capacitor-community/sqlite` on Android native runtime; IndexedDB with reactive local memory state on Web browsers.
  - *Why*: Delivers high-performance ACID compliance and persistent SQLite transactions on Android devices while allowing instantaneous browser preview, testing, and debugging.
- **Decision 2: Strict Client-Side SMS Parser & Deduplication**:
  - *Approach*: Native Android SMS Receiver + Content Resolver queried locally via a Java Capacitor plugin; parsed using robust regular expressions targeting debit patterns, ignoring credits, OTPs, balance queries, promos, and failed alerts.
  - *Why*: Preserves 100% privacy, complies with Google Play SMS policies by handling all text on-device, and maintains a distinct `sms_imported` cryptographic hash table to eliminate duplicate logs.
- **Decision 3: Universal WhatsApp & UPI Sharing Engine**:
  - *Approach*: Generates dual share options — direct WhatsApp intent (`whatsapp://send?text=` and `https://wa.me/?text=`) with encoded UPI deep links, alongside jsPDF bill exports saved to the app cache and exposed through Android `FileProvider`.
  - *Why*: Ensures seamless sharing regardless of whether the user or recipient is on Android, iOS, or Web, with zero reliance on cloud file hosting.
- **Decision 4: Versioned Migration & Backup Engine**:
  - *Approach*: Semantic schema versioning (v1 schema with migration hooks) and complete JSON payload export with checksum validation.
  - *Why*: Safeguards user data against app updates and device transfers without needing remote account backends.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BudgetMitra App Shell                         │
├────────────────────────────────────────────────────────────────────────┤
│  UI Layer (React 19 + TypeScript + Tailwind v4 + Lucide Icons)        │
│  ┌──────────────┬──────────────┬──────────────┬─────────────────────┐  │
│  │ Dashboard    │ Expenses &   │ Split Bill   │ "Can I Afford It?"  │  │
│  │ & Health     │ SMS Ingestion│ & WhatsApp   │ Decision Simulator  │  │
│  ├──────────────┼──────────────┼──────────────┼─────────────────────┤  │
│  │ Budget Plan  │ Loan & EMI   │ Scholarships │ Settings, Backup &  │  │
│  │ & Envelopes  │ Calculator   │ & Schemes    │ Permissions Hub     │  │
│  └──────────────┴──────────────┴──────────────┴─────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  State & Business Logic Layer                                          │
│  ┌───────────────────────┬─────────────────────────┬─────────────────┐ │
│  │ Multi-Lang (EN/HI/MR) │ Health Score Calculator │ SMS Rule Engine │ │
│  ├───────────────────────┼─────────────────────────┼─────────────────┤ │
│  │ Encryption & PIN Lock │ PDF/CSV Statement Parser│ Gamification XP │ │
│  └───────────────────────┴─────────────────────────┴─────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  Persistence Layer (Zero-Cloud, 100% Local)                            │
│  ┌─────────────────────────────────┬─────────────────────────────────┐ │
│  │ Capacitor SQLite (Android)      │ IndexedDB / LocalStorage (Web)  │ │
│  │ Tables: profile, transactions,  │ Full JSON Export & Import Engine│ │
│  │ budgets, goals, loans, schemes  │ Automatic Migration Runner      │ │
│  └─────────────────────────────────┴─────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  Android Platform & Capacitor 8 Bridge                                 │
│  ┌────────────────────────────────┬──────────────────────────────────┐ │
│  │ Native Java SMS Reader Plugin  │ FileProvider (Receipt PDF Share) │ │
│  ├────────────────────────────────┼──────────────────────────────────┤ │
│  │ Local Notifications Manager    │ WhatsApp Deep-Link Queries       │ │
│  └────────────────────────────────┴──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Database Schema (Local SQLite / IndexedDB)
- **`profile`**: `id`, `name`, `course`, `year`, `state`, `income_bracket`, `category`, `monthly_allowance`, `upi_id`, `language`, `pin_hash`, `biometric_enabled`, `created_at`
- **`transactions`**: `id`, `amount`, `category`, `type` (debit/credit), `note`, `merchant`, `source` (manual/sms/statement/split), `date`, `created_at`
- **`budgets`**: `id`, `category`, `allocated_amount`, `month`, `year`
- **`savings_goals`**: `id`, `title`, `target_amount`, `current_amount`, `target_date`, `icon`
- **`loans`**: `id`, `title`, `principal`, `interest_rate`, `tenure_months`, `loan_type` (education/personal/friend/zero_pct), `extra_monthly_payment`, `start_date`
- **`schemes`**: `id`, `title`, `provider`, `eligibility_criteria`, `benefit_amount`, `deadline`, `apply_url`, `category_tags`, `required_documents`
- **`sms_imported`**: `id`, `message_hash`, `sender`, `amount`, `merchant`, `raw_text`, `date_received`, `status` (imported/undone/dismissed)
- **`gamification`**: `id`, `streak_days`, `last_active_date`, `xp_points`, `level_title`, `unlocked_badges`
- **`settings`**: `key`, `value`

---

## 5. Execution Stages & Verification Plan

1. **Stage 1: Core Setup, Tooling & Build Configuration**:
   - Initialize package dependencies: React 19, Vite, Tailwind CSS v4, Lucide icons, Framer Motion, Recharts, jsPDF, papaparse, canvas-confetti, Capacitor 8 core and community plugins.
   - Setup Vitest test runner and testing utilities.
2. **Stage 2: Storage Engine & State Repositories**:
   - Create unified local persistence abstraction supporting both `@capacitor-community/sqlite` on Android and IndexedDB on Web.
   - Implement versioned migrations, seed data (demo engineering student dataset & Indian scholarship schemes), and export/import backup engine.
3. **Stage 3: SMS Ingestion & Bank Parsing Engine**:
   - Implement client-side parser with regex patterns for SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, BoB, Paytm, PhonePe, and generic UPI.
   - Create native Android Capacitor plugin in Java (`SmsReaderPlugin.java`) with permissions and live broadcast receiver hooks.
4. **Stage 4: Feature Implementations**:
   - Dashboard & Financial Health Score (4 pillars, monthly PDF statement generator).
   - Expense Tracker (CRUD, anomaly detector, CSV bulk import, preset chips).
   - "Can I Afford This?" decision simulator (trilingual).
   - Split the Bill (equal/custom splits, WhatsApp deep-link & FileProvider PDF sharing, UPI links).
   - Loan/EMI payoff calculator & Amortization charts.
   - Scholarship matcher & Document checklist.
   - Budget envelopes & Burn-rate projection slider.
   - Gamification engine (streaks, XP, badges, GitHub-style activity matrix).
   - Permissions Manager (onboarding & settings) & Security/PIN lock.
5. **Stage 5: Android Build, Packaging & GitHub Actions**:
   - Configure Capacitor Android project, `AndroidManifest.xml` with `<queries>` for WhatsApp, permissions, FileProvider XML, and App Icon assets.
   - Create `.github/workflows/android-apk.yml` for automated APK build and release publishing.
6. **Stage 6: Test Suite & Comprehensive Documentation**:
   - Run Vitest suite covering math formulas, health scoring, security sanitization, CSV/PDF/SMS parsing (40+ bank samples), split calculations, and storage migrations.
   - Document `README.md`, `ARCHITECTURE.md`, and `TESTING.md`.
