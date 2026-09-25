import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, FolderTree, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface SourceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface SourceFile {
  path: string;
  name: string;
  language: string;
  category: 'build' | 'entity' | 'dao' | 'repo' | 'calculator' | 'ui' | 'test';
  content: string;
}

const ANDROID_FILES: SourceFile[] = [
  {
    path: 'android/app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'build',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.udharmanager.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.udharmanager.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true; buildConfig = true }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.work.runtime.ktx)
    testImplementation(libs.junit)
}`,
  },
  {
    path: 'android/app/src/main/java/com/udharmanager/app/domain/calculator/LedgerCalculator.kt',
    name: 'LedgerCalculator.kt',
    language: 'kotlin',
    category: 'calculator',
    content: `package com.udharmanager.app.domain.calculator

import com.udharmanager.app.data.entities.*
import kotlin.math.roundToLong

object LedgerCalculator {
    fun calculatePersonBalance(
        personId: Long,
        transactions: List<TransactionEntity>,
        isSettled: Boolean = false
    ): PersonBalanceSummary {
        var totalLent = 0.0
        var totalReceived = 0.0
        var totalBorrowed = 0.0
        var totalRepaid = 0.0
        var totalInterestAccrued = 0.0
        var totalAdjustments = 0.0

        for (tx in transactions) {
            when (tx.type) {
                TransactionType.LEND -> totalLent += tx.amount
                TransactionType.PAYMENT_RECEIVED -> totalReceived += tx.amount
                TransactionType.BORROW -> totalBorrowed += tx.amount
                TransactionType.PAYMENT_MADE -> totalRepaid += tx.amount
                TransactionType.INTEREST -> totalInterestAccrued += tx.amount
                TransactionType.ADJUSTMENT -> totalAdjustments += tx.amount
            }
        }

        // Outstanding = Amount Owed + Interest - Payments
        // User Liability = Amount Borrowed + Interest - Payments Made
        val lendingSide = totalLent + totalInterestAccrued - totalReceived + totalAdjustments
        val borrowingSide = totalBorrowed - totalRepaid
        val net = lendingSide - borrowingSide

        val outstandingOwedToUser = if (net > 0) net else 0.0
        val liabilityOwedByUser = if (net < 0) -net else 0.0

        return PersonBalanceSummary(
            personId = personId,
            totalLent = totalLent,
            totalReceived = totalReceived,
            totalBorrowed = totalBorrowed,
            totalRepaid = totalRepaid,
            totalInterestAccrued = totalInterestAccrued,
            outstandingOwedToUser = if (isSettled) 0.0 else outstandingOwedToUser,
            liabilityOwedByUser = if (isSettled) 0.0 else liabilityOwedByUser,
            netBalance = if (isSettled) 0.0 else net,
            isSettled = isSettled
        )
    }
}`,
  },
  {
    path: 'android/app/src/main/java/com/udharmanager/app/data/entities/Entities.kt',
    name: 'Entities.kt (Room)',
    language: 'kotlin',
    category: 'entity',
    content: `@Entity(tableName = "people")
data class PersonEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val phone: String,
    val category: PersonCategory = PersonCategory.FRIEND,
    val notes: String = "",
    val defaultLanguage: Language = Language.ENGLISH,
    val isSettled: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "transactions",
    foreignKeys = [ForeignKey(entity = PersonEntity::class, parentColumns = ["id"], childColumns = ["personId"], onDelete = ForeignKey.CASCADE)],
    indices = [Index(value = ["personId"])]
)
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val personId: Long,
    val type: TransactionType,
    val amount: Double,
    val date: Long = System.currentTimeMillis(),
    val description: String = "",
    val paymentMethod: PaymentMethod = PaymentMethod.CASH,
    val interestRate: Double = 0.0,
    val interestPeriod: InterestPeriod = InterestPeriod.NONE,
    val dueDate: Long? = null
)`,
  },
  {
    path: 'android/app/src/main/java/com/udharmanager/app/sms/SmsHelper.kt',
    name: 'SmsHelper.kt (Dual Mode)',
    language: 'kotlin',
    category: 'ui',
    content: `object SmsHelper {
    fun sendOrComposeReminderSms(
        context: Context,
        phoneNumber: String,
        messageText: String
    ): SmsSendResult {
        val hasPerm = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED

        if (hasPerm) {
            val smsManager = context.getSystemService(SmsManager::class.java)
            smsManager.sendMultipartTextMessage(phoneNumber, null, smsManager.divideMessage(messageText), null, null)
            return SmsSendResult(true, "DIRECT_SMS", "Direct SMS dispatched")
        } else {
            // Compliant Android Intent fallback: opens SMS composer pre-filled
            val uri = Uri.parse("smsto:\${Uri.encode(phoneNumber)}")
            val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
                putExtra("sms_body", messageText)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            return SmsSendResult(true, "COMPOSER_OPENED", "SMS composer opened")
        }
    }
}`,
  },
  {
    path: 'android/app/src/test/java/com/udharmanager/app/LedgerCalculatorTest.kt',
    name: 'LedgerCalculatorTest.kt',
    language: 'kotlin',
    category: 'test',
    content: `class LedgerCalculatorTest {
    @Test
    fun test1_LendingRahulTenThousand() {
        val txs = listOf(TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0))
        val summary = LedgerCalculator.calculatePersonBalance(1, txs)
        assertEquals(10000.0, summary.outstandingOwedToUser, 0.01)
    }

    @Test
    fun test3_InterestAddition() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0),
            TransactionEntity(id = 2, personId = 1, type = TransactionType.PAYMENT_RECEIVED, amount = 2000.0),
            TransactionEntity(id = 3, personId = 1, type = TransactionType.INTEREST, amount = 200.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(1, txs)
        assertEquals(8200.0, summary.outstandingOwedToUser, 0.01) // 10,000 - 2,000 + 200 = 8,200
    }
}`,
  },
];

export const SourceInspectorModal: React.FC<SourceInspectorModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const [activeFile, setActiveFile] = useState<SourceFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl h-[88vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden ${
          isDarkMode
            ? 'bg-[#14151B] border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Native Android Kotlin & Room Project</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Gradle 8.8 + Compose M3
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Inspect genuine native Android files, test suite, and Gradle APK build configs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Build Banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2 font-mono">
            <Terminal size={14} className="text-emerald-400 shrink-0" />
            <span>./gradlew assembleDebug</span>
            <span className="text-neutral-500">→</span>
            <span className="text-neutral-300">app/build/outputs/apk/debug/app-debug.apk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">Target SDK: 35 (Android 15)</span>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* File sidebar */}
          <div className="w-64 border-r border-neutral-800/80 bg-neutral-950/40 p-3 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 py-1">
              Project Explorer
            </div>
            {ANDROID_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setActiveFile(file)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                  activeFile.path === file.path
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <FileCode size={14} className="shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#0D0E12] overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-800/60 bg-neutral-900/30 text-[11px] text-neutral-400 font-mono flex items-center justify-between">
              <span>{activeFile.path}</span>
              <span className="uppercase text-[10px] text-emerald-500 font-bold">{activeFile.language}</span>
            </div>
            <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-neutral-300 leading-relaxed selection:bg-emerald-500/30">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
