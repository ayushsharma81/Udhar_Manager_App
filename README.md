# 💰 Udhar Manager

### Personal Lending, Borrowing & Outstanding Payment Tracker for Android

**Udhar Manager** is a native Android application designed to help individuals keep track of money they **lend, borrow, receive, and repay**.

It maintains a complete transaction ledger, automatically calculates outstanding balances and interest, provides payment reminders, and generates Hindi, English, Hinglish, or custom payment messages.

> **Track. Remind. Settle.**

---

## 📱 About the App

Managing personal loans and informal payments between friends, relatives, customers, and merchants can become difficult when there are multiple transactions.

Udhar Manager solves this problem by providing a centralized personal ledger where users can easily answer:

- 💰 Who owes me money?
- 💸 Whom do I owe?
- 📊 How much is outstanding?
- 📅 When is the payment due?
- 📈 How much interest has accumulated?
- 🔔 When should I send a reminder?
- 🧾 What is the final settlement amount?

The application is designed as a **native Android mobile application**, not a web application.

---

# ✨ Features

## 👥 People Management

Add and manage:

- Friends
- Relatives
- Customers
- Merchants
- Other contacts

Each person can have:

- Name
- Phone number
- Category
- Notes
- Default reminder language
- Complete financial history

---

## 💰 Lending & Borrowing

Record both directions of money movement.

### Money You Lend

Example:

```text
You → Rahul
₹10,000
```

Rahul owes you ₹10,000.

### Money You Borrow

Example:

```text
Amit → You
₹5,000
```

You owe Amit ₹5,000.

---

## 📒 Complete Transaction Ledger

Every financial activity is stored as an individual transaction.

Supported transaction types:

- Money Lent
- Money Borrowed
- Payment Received
- Payment Made
- Interest Added
- Adjustment

Each transaction can contain:

- Person
- Amount
- Date
- Description
- Payment method
- Due date
- Interest information

Supported payment methods:

- Cash
- UPI
- Bank Transfer
- Card
- Other

---

# 🧮 Automatic Outstanding Calculation

The app calculates balances from the transaction history instead of relying on a manually entered balance.

For example:

```text
Money Lent       ₹10,000
Payment Received ₹2,000
Interest         ₹200
-----------------------
Outstanding      ₹8,200
```

### Formula

```text
Outstanding = Lent - Payments Received + Interest
```

For money the user owes:

```text
Liability = Borrowed - Payments Made + Interest
```

This keeps the financial ledger consistent and auditable.

---

# 📈 Interest Calculator

Optional interest tracking supports:

- No interest
- Simple interest
- Monthly interest
- Yearly interest
- Custom interest rates

Example:

```text
Principal       ₹10,000
Interest Rate   2% / month
Interest        ₹200
Payment         ₹2,000
Outstanding     ₹8,200
```

The application clearly displays how the interest was calculated.

---

# 📅 Due Dates

Users can assign due dates to outstanding accounts.

The app identifies:

- Due today
- Due tomorrow
- Due soon
- Overdue
- No due date

---

# 🔔 Payment Reminders

Schedule reminders based on the payment due date.

Supported reminder timing includes:

- 7 days before
- 3 days before
- 1 day before
- On due date
- 1 day after
- Every 7 days
- Custom intervals

The application uses Android notifications for payment reminders.

---

# 💬 SMS Reminders

Generate payment reminders automatically.

### English

> Hi Rahul, just a reminder that ₹7,200 is currently outstanding. Please confirm the payment date and amount. Thank you.

### Hindi

> नमस्ते राहुल, याद दिलाना था कि आपके खाते में ₹7,200 बाकी हैं। कृपया भुगतान की तारीख और राशि की पुष्टि कर दें। धन्यवाद।

### Hinglish

> Hi Rahul, ₹7,200 abhi outstanding hain. Jab possible ho payment kar dena. Thanks!

Users can also create their own custom templates.

### Supported variables

```text
{name}
{amount}
{due_date}
{interest}
{days_overdue}
```

---

# 📱 Android SMS Integration

The application supports two SMS approaches depending on Android/device restrictions:

### Native SMS Composer

Opens the Android SMS application with:

- Recipient pre-filled
- Message pre-filled

The user reviews and sends the message.

### Direct SMS

Where Android permissions and device policies allow it, direct SMS functionality can be used with the appropriate `SEND_SMS` permission.

The application does **not** falsely report an SMS as sent when Android has not confirmed the operation.

---

# 🤝 Settlement

The Settlement feature calculates the final amount between the user and another person.

Example:

```text
Rahul Sharma

Money Lent       ₹25,000
Money Received   ₹18,000
Interest          ₹1,200
------------------------
Outstanding       ₹8,200
```

The account can then be marked as:

**Settled**

Historical transactions remain available after settlement.

---

# 🧾 Account Statements

Each person has a complete transaction statement.

Example:

```text
Rahul Sharma

10 Sep
Money Lent
+₹10,000
Balance: ₹10,000

15 Sep
Payment Received
-₹2,000
Balance: ₹8,000

30 Sep
Interest
+₹200
Balance: ₹8,200
```

Statements can be shared and exported.

---

# 📊 Dashboard

The home screen provides a quick financial overview.

Example:

```text
Total Outstanding
₹28,450

Others Owe Me
₹35,000

I Owe Others
₹6,550

Interest
₹1,240
```

It also displays:

- Upcoming payments
- Recent transactions
- Overdue accounts
- Quick actions

---

# 📊 Analytics

The analytics section can show:

- Total money lent
- Total money recovered
- Total outstanding
- Total money borrowed
- Total money repaid
- Current liability
- Interest earned
- Interest paid
- Monthly lending
- Monthly repayments
- Outstanding by person
- Cash flow

---

# 🔎 Search & Filters

Search by:

- Person name
- Phone number
- Transaction description

Filter transactions/accounts by:

- They owe me
- I owe them
- Paid
- Pending
- Overdue
- Due soon
- Interest

---

# 💾 Offline-First

The core ledger works locally on the Android device.

Users can:

- Add people
- Record transactions
- View balances
- View history
- Calculate outstanding amounts
- Manage reminders

without requiring an internet connection.

The application uses **Room Database** for local persistence.

---

# 🔐 Security

The application is designed to protect personal financial information.

Planned/implemented security features include:

- PIN protection
- Biometric authentication where supported
- Secure local storage
- User data isolation
- No unnecessary sensitive-data logging

---

# 🏗️ Tech Stack

## Android

- **Kotlin**
- **Jetpack Compose**
- **Material 3**
- **Android SDK**
- **Room Database**
- **SQLite**
- **WorkManager**
- **Android Notifications**
- **Android SMS APIs**
- **Jetpack Navigation**
- **ViewModel**

## Build

- Gradle
- Kotlin DSL
- Android Gradle Plugin
- JDK 17+

---

# 🏛️ Architecture

The native Android application follows a layered architecture:

```text
UI
 │
 ▼
ViewModel
 │
 ▼
Repository
 │
 ▼
Room Database
```

Suggested project structure:

```text
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/udharmanager/app/
│   │   │   │
│   │   │   ├── data/
│   │   │   │   ├── database/
│   │   │   │   ├── entities/
│   │   │   │   ├── dao/
│   │   │   │   └── repository/
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   └── calculator/
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │
│   │   │   ├── sms/
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── theme/
│   │   │   │   └── viewmodel/
│   │   │   │
│   │   │   ├── MainActivity.kt
│   │   │   └── UdharApplication.kt
│   │   │
│   │   └── test/
│   │
│   ├── build.gradle.kts
│   └── proguard-rules.pro
│
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── gradle/
```

---

# 🧪 Example Calculation

### Rahul

User lends:

```text
₹10,000
```

Rahul pays:

```text
₹2,000
```

Interest:

```text
2% monthly
```

Interest:

```text
₹200
```

Final outstanding:

```text
₹10,000 - ₹2,000 + ₹200

= ₹8,200
```

The app displays:

**Rahul owes you ₹8,200**

---

# 🧪 Test Cases

### Lending

```text
₹10,000 lent
→ Outstanding ₹10,000
```

### Partial repayment

```text
₹10,000 lent
₹2,000 received
→ Outstanding ₹8,000
```

### Interest

```text
₹10,000 principal
2% interest
→ ₹200 interest
→ ₹8,200 outstanding after ₹2,000 repayment
```

### Borrowing

```text
₹5,000 borrowed
→ User liability ₹5,000
```

### Repayment

```text
₹5,000 borrowed
₹1,500 repaid
→ Liability ₹3,500
```

### Settlement

```text
Final payment received
→ Outstanding ₹0
→ Account marked Settled
```

Historical transactions remain preserved.

---

# 🚀 Running the Android Application

## Requirements

Install:

- JDK 17 or later
- Android SDK
- Android SDK Platform 35+
- Android Build Tools 35+
- Gradle-compatible environment

Android Studio is recommended but **not mandatory**.

---

## Build APK Without Android Studio

Open Terminal and navigate to the Android project:

```bash
cd android
```

Make the Gradle wrapper executable on macOS/Linux:

```bash
chmod +x ./gradlew
```

Build the debug APK:

```bash
./gradlew assembleDebug
```

The APK will be generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

# 📲 Install APK on Android Phone

If ADB is configured and USB debugging is enabled:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Alternatively, transfer the APK to an Android phone and install it manually.

---

# 🧪 Run Tests

From the `android` directory:

```bash
./gradlew test
```

---

# 📦 Build Release AAB

For Google Play Store distribution:

```bash
./gradlew bundleRelease
```

Output:

```text
app/build/outputs/bundle/release/app-release.aab
```

A release build should be properly signed before publishing.

---

# 🛠️ Development

Clone the repository:

```bash
git clone https://github.com/ayushsharma81/Udhar_Manager_App.git
```

Enter the project:

```bash
cd Udhar_Manager_App
```

Enter the Android project:

```bash
cd android
```

Build:

```bash
./gradlew assembleDebug
```

---

# 📌 Project Status

**Current version:** `1.0.0`

**Platform:** Android

**Minimum Android version:** Android 8.0 (API 26)

**Target SDK:** 35

**Compile SDK:** 35

**Application ID:**

```text
com.udharmanager.app
```

---

# 🗺️ Roadmap

## Phase 1 — Core Ledger

- [x] Person management
- [x] Lending
- [x] Borrowing
- [x] Payments
- [x] Transaction ledger
- [x] Outstanding calculation
- [x] Local database

## Phase 2 — Reminders

- [x] Due dates
- [x] Android notifications
- [x] SMS integration
- [x] Message templates
- [x] Hindi messages
- [x] English messages
- [x] Hinglish messages

## Phase 3 — Financial Tools

- [x] Interest calculation
- [x] Settlement
- [x] Transaction history
- [x] Analytics

## Phase 4 — Future

- [ ] Cloud backup
- [ ] Multi-device synchronization
- [ ] Advanced reports
- [ ] Recurring transactions
- [ ] Advanced analytics
- [ ] Google Play Store release

---

# ⚠️ SMS & Android Permissions

SMS functionality depends on Android permissions, device configuration, and platform restrictions.

The application should request SMS permissions only when necessary.

If direct SMS sending is unavailable, the application can open the native Android SMS composer with the recipient and message pre-filled.

---

# 🔒 Privacy

Udhar Manager handles potentially sensitive financial information.

Users should only record information they have the right to store and manage.

The application is designed around local-first data storage and should avoid unnecessarily transmitting financial information to external services.

---

# 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run tests.

```bash
./gradlew test
```

5. Commit your changes.

```bash
git commit -m "Add your feature"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

---

# 📄 License

License information will be added before public distribution.

---

# 👨‍💻 Author

**Ayush Sharma**

GitHub:  
https://github.com/ayushsharma81

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**Udhar Manager — Track. Remind. Settle.**
