package com.udharmanager.app.data.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

enum class PersonCategory {
    FRIEND, RELATIVE, CUSTOMER, MERCHANT, OTHER
}

enum class TransactionType {
    LEND,              // User gives money to other person
    BORROW,            // User takes money from other person
    PAYMENT_RECEIVED,  // Other person pays user back
    PAYMENT_MADE,      // User pays other person back
    INTEREST,          // Interest added to balance
    ADJUSTMENT         // Manual adjustment with reason
}

enum class PaymentMethod {
    CASH, UPI, BANK_TRANSFER, CARD, OTHER
}

enum class InterestPeriod {
    NONE, MONTHLY, YEARLY, CUSTOM
}

enum class ReminderStatus {
    SCHEDULED, SENT, SMS_COMPOSER_OPENED, FAILED, CANCELLED
}

enum class ReminderType {
    SMS, NOTIFICATION, WHATSAPP
}

enum class Language {
    ENGLISH, HINDI, HINGLISH, CUSTOM
}

@Entity(tableName = "people")
data class PersonEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val phone: String,
    val category: PersonCategory = PersonCategory.FRIEND,
    val notes: String = "",
    val defaultLanguage: Language = Language.ENGLISH,
    val isSettled: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "transactions",
    foreignKeys = [
        ForeignKey(
            entity = PersonEntity::class,
            parentColumns = ["id"],
            childColumns = ["personId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["personId"])]
)
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val personId: Long,
    val type: TransactionType,
    val amount: Double,
    val date: Long = System.currentTimeMillis(),
    val description: String = "",
    val paymentMethod: PaymentMethod = PaymentMethod.CASH,
    val interestRate: Double = 0.0,
    val interestPeriod: InterestPeriod = InterestPeriod.NONE,
    val dueDate: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "reminders",
    foreignKeys = [
        ForeignKey(
            entity = PersonEntity::class,
            parentColumns = ["id"],
            childColumns = ["personId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["personId"])]
)
data class ReminderEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val personId: Long,
    val transactionId: Long? = null,
    val amount: Double,
    val message: String,
    val scheduledAt: Long,
    val status: ReminderStatus = ReminderStatus.SCHEDULED,
    val type: ReminderType = ReminderType.SMS,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "message_templates")
data class MessageTemplateEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val language: Language,
    val template: String,
    val isDefault: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "settlements",
    foreignKeys = [
        ForeignKey(
            entity = PersonEntity::class,
            parentColumns = ["id"],
            childColumns = ["personId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["personId"])]
)
data class SettlementEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val personId: Long,
    val amount: Double,
    val settledAt: Long = System.currentTimeMillis(),
    val notes: String = ""
)
