# 💰 BudgetMitra — Student Money Manager

Track spending automatically from your **bank SMS**, plan budgets, check "Can I afford this?", split bills and find scholarships — built for college students in India (₹, UPI, Hindi / Marathi support).

Glassmorphism UI · light & dark mode · works as a website and as an **Android app**.

---

## ✨ Headline feature: SMS Tracker (Android)

Your bank and UPI alerts become spending — no typing.

| | |
|---|---|
| **Live** | A new debit SMS is added to Expenses the moment it arrives (app open). |
| **Catch-up** | Alerts that arrived while the app was closed are added when you open it. |
| **Safe** | Each SMS is imported once. Every auto-add has a one-tap **Undo**. |
| **Smart filter** | Only money going **out** is added. Salary, refunds, OTPs, promos, failed payments, bill reminders and chats from friends are ignored. |
| **Private** | SMS are read and parsed on the phone. Nothing is uploaded. |

Understands alerts from SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, Bank of Baroda, Paytm, PhonePe and other UPI apps, including card spends, UPI `VPA` payments and `Info:` style narrations.

**First run:** SMS Tracker → *Allow SMS access* → optionally *Scan past messages* to review the last 7 / 30 / 90 days → switch on *Auto-add new spending*.

> **Android 13+ note:** for apps installed from an APK file, Android may grey out the SMS permission. Open *Settings → Apps → BudgetMitra → ⋮ → Allow restricted settings*, then grant the permission.
> **Distribution note:** Google Play restricts SMS permissions to a few app categories. Share the APK directly; a Play Store release would need an SMS permission declaration.

## 🏦 Import from Bank (any platform)

Expenses → **Import from Bank**: pull spending from a **bank statement PDF** (password-protected ones too), a **bank / UPI CSV**, or **pasted SMS**. You review every row (category editable), duplicates are flagged, and credits are shown but never counted as spending.

## 📚 Other features

Dashboard & financial-health score · Expenses with spike detection · Budget envelopes & goals · Loan / EMI simulator · "Can I afford this?" (rule-based verdict in EN / हिं / मरा) · Split the bill · Scholarship & scheme eligibility · Habits & streaks · PDF monthly report · Guest and demo modes · Offline-first with local storage.

## 📱 Get the APK

The app is wrapped with [Capacitor](https://capacitorjs.com). GitHub Actions (`.github/workflows/android-apk.yml`) builds **BudgetMitra.apk** on every push to `main` and attaches it to the **`apk-latest`** release — one stable download link.

Local build: `npm run android:sync && npm run android:open` (Android Studio, JDK 21).

Optional repo secrets for cloud sync: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Without them the app runs fully in local mode.

## 🧰 Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Framer Motion · Recharts · Supabase (optional) · Capacitor 8 (Android) · pdf.js · jsPDF · Vitest + Testing Library.

## 🧪 Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run build      # type-check + production build
```

## 🗂 Where things live

```
src/utils/smsGeneric.ts      format-agnostic SMS understanding (direction, amount, merchant, OTP/promo filters)
src/utils/smsParser.ts       bank-specific patterns + generic fallback
src/services/smsInbox.ts     bridge to the native Android plugin, SMS → transaction
src/context/SmsTrackerContext.tsx   live capture, catch-up, de-dupe, undo
src/pages/SmsTracker.tsx     SMS Tracker screen
src/utils/statementParser.ts + src/services/pdfText.ts   CSV / PDF / SMS statement extraction
src/components/StatementImportModal.tsx                  review & import UI
android/app/src/main/java/com/budgetmitra/app/SmsReaderPlugin.java   native SMS reader
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [PROJECT.md](PROJECT.md) and [DESIGN.md](DESIGN.md) for more.

---

Built for the **SkillUp Hackathon × IBM SkillsBuild** — Financial Literacy.
