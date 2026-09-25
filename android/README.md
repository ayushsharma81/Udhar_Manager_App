# Udhar Manager — Native Android Mobile Application

Built using **Kotlin**, **Jetpack Compose (Material 3)**, **Room Database**, **WorkManager**, and **Android SDK**.

## Project Architecture
- **Language**: Kotlin 2.0.21
- **UI Framework**: Jetpack Compose with Material Design 3
- **Local Database**: Room 2.6.1 (SQLite local engine with TypeConverters and Cascade foreign keys)
- **Background Engine**: WorkManager for reliable offline-first background payment due notifications
- **SMS System**: Dual-mode SMS integration (direct dispatch with `SEND_SMS` permission or automatic intent launch of native Android SMS Composer `smsto:`)
- **Ledger Engine**: Immutable transaction accounting (`Outstanding = Lent - Received + Interest`)

```
android/
├── app/
│   ├── build.gradle.kts
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/udharmanager/app/
│   │   │   │   ├── UdharApplication.kt
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── data/
│   │   │   │   │   ├── database/UdharDatabase.kt
│   │   │   │   │   ├── entities/Entities.kt
│   │   │   │   │   ├── dao/Daos.kt
│   │   │   │   │   └── repository/UdharRepository.kt
│   │   │   │   ├── domain/calculator/LedgerCalculator.kt
│   │   │   │   ├── notifications/ReminderWorker.kt
│   │   │   │   ├── sms/SmsHelper.kt
│   │   │   │   └── ui/
│   │   │   │       ├── theme/Theme.kt
│   │   │   │       └── viewmodel/UdharViewModel.kt
│   │   │   └── res/
│   │   └── test/java/com/udharmanager/app/
│   │       └── LedgerCalculatorTest.kt
├── gradle/libs.versions.toml
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

---

## How to Build the APK

### 1. Requirements
- JDK 17 or JDK 21 (Temurin / OpenJDK)
- Android SDK 35+ (build-tools 35.0.0+)
- Android Studio Ladybug / Meerkat (recommended) or Gradle command line

### 2. Command Line APK Build
Navigate to the `android/` directory and run:

```bash
# Make gradlew executable if on Linux/macOS
chmod +x ./gradlew

# Build Debug APK
./gradlew assembleDebug
```

### 3. Locating the Generated APK
Once compilation completes, the ready-to-install debug APK is located at:
```
app/build/outputs/apk/debug/app-debug.apk
```

To install directly to a connected Android phone via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 4. Build Release AAB (Google Play Store)
```bash
./gradlew bundleRelease
```
Output:
```
app/build/outputs/bundle/release/app-release.aab
```

---

## Verified Test Cases
Run the unit test suite:
```bash
./gradlew test
```
The test suite verifies:
1. **Lending**: ₹10,000 lent to Rahul => Rahul owes ₹10,000
2. **Partial Repayment**: Rahul pays ₹2,000 => Outstanding = ₹8,000
3. **Interest Addition**: 2% monthly interest added => Outstanding = ₹8,200
4. **Borrowing**: User borrows ₹5,000 from Amit => User liability = ₹5,000
5. **Repayment Made**: User repays ₹1,500 => User liability = ₹3,500
6. **Settlement**: Rahul pays final ₹8,200 => Outstanding = ₹0, Account status = Settled, and all historical transactions remain completely preserved.
