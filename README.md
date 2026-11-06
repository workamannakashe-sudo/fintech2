# BudgetMitra — Student Money Manager (₹, UPI, English / हिन्दी / मराठी)

**BudgetMitra** is an offline-first, privacy-respecting financial companion designed specifically for college students in India. It works both as a modern web application and as an installable native Android APK.

---

## Key Highlights

- **100% On-Device & Zero Cloud**: Your money data never leaves your phone. No logins, no Supabase, no external telemetry.
- **Automated Bank SMS Tracker**: Native on-device SMS parser for SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, BoB, Paytm, PhonePe, and generic UPI alerts. Only logs positive debits; strictly ignores OTPs, inward credits, promotional loans, and failed attempts.
- **Financial Health Score (0–100, Grade A+ to D)**: Multi-pillar health score derived from Savings Rate, Budget Adherence, Anomaly Risk, and Logging Discipline with daily rule-based insights.
- **"Can I Afford This?" Pre-Purchase Simulator**: Multilingual simulator (English, Hindi, Marathi) checking real-time cash runway impact and semester savings goal delays.
- **Split the Bill & WhatsApp Pay**: Split bills equally or by custom percentage with exact paisa precision, receipt image scanner, and WhatsApp deep-linking with individual `upi://pay` links.
- **Student Loans & 0% EMI Calculator**: Amortization schedules and accelerated payoff calculations showing interest and months saved.
- **Indian Scholarship Matcher**: Instant matching against PMSS, Post-Matric OBC, Tata Trusts, CSSS, Vidya Lakshmi, Bihar Credit Card, AICTE Pragati, and Gujarat MYSY schemes with document checklists.
- **Envelope Budgeting**: Real-time spending velocity and projected balance exhaustion date with what-if sliders.
- **Gamification**: Streaks, XP, achievement badges, confetti rewards, and a GitHub-style 90-day activity heatmap.
- **Backup & Restore**: Export and import complete encrypted JSON archives via device share sheet or local filesystem.

---

## Tech Stack

- **Frontend**: React 19, TypeScript (Strict), Vite, Tailwind CSS v4, Lucide React, Framer Motion, Recharts
- **Storage**: On-device SQLite / IndexedDB abstraction with versioned migrations
- **Document & Export**: jsPDF, jsPDF-AutoTable, PapaParse (CSV)
- **Mobile Engine**: Android SDK (API 24 to 36), Native Java SMS Reader Plugin, FileProvider
- **Testing & Quality**: Vitest, React Testing Library, Oxlint

---

## How to Build & Install on Android Phone

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: complete BudgetMitra student money manager"
git push origin main
```

### Step 2: Automated APK Build via GitHub Actions
1. Navigate to the **Actions** tab on your GitHub repository.
2. Select the **Build & Release BudgetMitra APK** workflow.
3. The workflow will automatically test, compile the web assets, build the Android APK with Gradle, and upload `BudgetMitra.apk` both as a workflow artifact and as a GitHub Release tagged `apk-latest`.

### Step 3: Installing the APK on Android
1. Download `BudgetMitra.apk` from the GitHub Release directly on your phone.
2. Tap on the APK to install. If prompted, enable **Install unknown apps** for your browser or file manager.
3. Open BudgetMitra.

### Step 4: Android 13+ SMS Permission ("Allow Restricted Settings")
On Android 13 and higher, Google blocks accessibility and SMS permissions for sideloaded APKs by default. To enable automatic SMS tracking:
1. Long-press the **BudgetMitra** app icon on your home screen and tap **App info** (or go to `Settings -> Apps -> BudgetMitra`).
2. Tap the **3-dots menu** in the top-right corner.
3. Tap **Allow restricted settings**.
4. Authenticate with your fingerprint or device PIN.
5. Re-open BudgetMitra and tap **Grant** in the Permissions tab.
