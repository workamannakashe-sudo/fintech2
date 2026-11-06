# BudgetMitra — Device Testing & QA Checklist

This checklist is designed for hands-on verification on physical Android phones (Android 10 through Android 15) and web browsers.

---

## 1. Automated Test Suite (Verified in Environment)

- **Vitest Unit Tests**: 52 passed tests across 4 test suites:
  - `src/test/smsParser.test.ts`: 36 real-world bank/UPI debit, credit, OTP, promo, and failed transaction message assertions across SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, BoB, Paytm, and PhonePe.
  - `src/test/financeMath.test.ts`: Health scoring (Grade A+ to D), 2x anomaly spike detection, afford simulator verdicts, loan payoff formulas, exact-paisa bill splits, and UPI URI construction.
  - `src/test/storage.test.ts`: Schema migrations, demo dataset initialization, complete JSON export/import verification, and clean data reset.
  - `src/test/schemes.test.ts`: PMSS, Post-Matric OBC, AICTE Pragati, and Bihar Credit Card matching.
- **Production Build**: `npm run build` compiled with zero TypeScript errors.
- **Android Compilation**: `compile_applet` compiled `com.budgetmitra.app` debug APK successfully with Gradle.

---

## 2. Real-Device Manual Testing Checklist

### Permission Matrix
- [ ] **READ_SMS (First Ask)**:
  - Go to **Privacy** tab or tap **Scan SMS Now**.
  - Tap **Grant**. The Android system permission dialog should appear.
  - Grant permission: The status badge should update to **Granted** (Green).
- [ ] **READ_SMS (Denied)**:
  - Deny permission: Status should show **Denied** (Red).
  - The app must continue to function normally with manual expense entry and CSV imports.
- [ ] **READ_SMS (Permanently Denied / Don't Ask Again)**:
  - Deny twice: Tap **Open App Settings**. It should launch your phone's App Info page.
- [ ] **Android 13+ Restricted Settings**:
  - If SMS permission is grayed out, open `App Info -> 3-dots -> Allow restricted settings` -> authenticate -> toggle permission.
- [ ] **Camera Permission**:
  - In **Split Bill**, tap **Upload / Scan Receipt Photo**.
  - Verify camera preview or photo picker launches.
- [ ] **POST_NOTIFICATIONS (Android 13+)**:
  - Grant notification permission to verify local streak reminders.

---

### Airplane-Mode / Offline Verification
- [ ] Put your phone in **Airplane Mode** (disable Wi-Fi and Mobile Data).
- [ ] Launch BudgetMitra.
- [ ] Verify that:
  - All fonts (Outfit and Plus Jakarta Sans) render correctly.
  - Dashboard health scores and charts load immediately from local SQLite.
  - Quick-log preset chips log expenses with zero delay.
  - Anomaly detection, afford simulator, and loan calculators work with 0 ms latency.
  - Scholarship criteria can be reviewed without internet access.

---

### WhatsApp Bill Sharing
- [ ] **With WhatsApp Installed**:
  - Go to **Split Bill**.
  - Enter total bill ₹750, 3 friends.
  - Tap **Send via WhatsApp**.
  - Verify WhatsApp opens with a pre-filled itemized breakdown and individual `upi://pay` links.
- [ ] **Without WhatsApp Installed**:
  - Tap **Send via WhatsApp**.
  - Verify the app falls back gracefully to the Android System Share Sheet (`Intent.createChooser`) allowing Telegram, Gmail, SMS, or Clipboard copy.
- [ ] **PDF Invoice Attachment**:
  - In Split Bill, tap **Share Bill PDF Invoice**.
  - Verify the PDF is saved to the app cache and exposed through `com.budgetmitra.app.fileprovider`.

---

### Backup, Restore & Data Reset
- [ ] Go to **Settings -> Backup & Restore**.
- [ ] Tap **Export Backup JSON**:
  - A file named `BudgetMitra_Backup_YYYY-MM-DD.json` should download or open the Android share sheet.
- [ ] Add 2 test expenses.
- [ ] Tap **Delete All My Data** and confirm:
  - All transactions and envelopes should reset to a clean Guest state.
- [ ] Tap **Import Backup JSON** and pick the previously exported JSON:
  - The app should restore all previous transactions, budgets, goals, and profile settings.

---

### App Lock (PIN & Biometric)
- [ ] Go to **Settings -> Security & App Lock**.
- [ ] Enable **4-Digit PIN Lock** and set a PIN (e.g., `1234`).
- [ ] Tap the **Lock icon** in the top header.
- [ ] Verify the app screen is replaced with the numeric keypad.
- [ ] Enter wrong PIN: Red error shake.
- [ ] Enter `1234`: App unlocks immediately.
- [ ] Tap the **Fingerprint icon**: Authenticates and unlocks.

---

## 3. Items Requiring Verification on Your Real Phone

Because the cloud development environment does not possess a physical cellular modem with an active SIM card, please verify these two real-world interactions on your phone:
1. **Live Carrier SMS Receipt**: Send a real ₹10 UPI payment to a friend via GPay/PhonePe to receive a live SMS alert from your bank, open BudgetMitra, tap **Scan SMS Now**, and verify that the debit is detected and displayed in the review list.
2. **Device Hardware Fingerprint Scanner**: Test the biometric lock toggle against your physical phone's fingerprint sensor or Face Unlock.
