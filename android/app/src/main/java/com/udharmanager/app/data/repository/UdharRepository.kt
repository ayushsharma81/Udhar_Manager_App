package com.udharmanager.app.data.repository

import com.udharmanager.app.data.database.UdharDatabase
import com.udharmanager.app.data.entities.*
import com.udharmanager.app.domain.calculator.DashboardSummary
import com.udharmanager.app.domain.calculator.LedgerCalculator
import com.udharmanager.app.domain.calculator.PersonBalanceSummary
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first

class UdharRepository(private val db: UdharDatabase) {

    val allPeople: Flow<List<PersonEntity>> = db.personDao().getAllPeople()
    val allTransactions: Flow<List<TransactionEntity>> = db.transactionDao().getAllTransactions()
    val allReminders: Flow<List<ReminderEntity>> = db.reminderDao().getAllReminders()
    val allTemplates: Flow<List<MessageTemplateEntity>> = db.messageTemplateDao().getAllTemplates()

    fun getTransactionsForPerson(personId: Long): Flow<List<TransactionEntity>> {
        return db.transactionDao().getTransactionsForPerson(personId)
    }

    fun getPerson(personId: Long): Flow<PersonEntity?> {
        return db.personDao().getPersonFlow(personId)
    }

    /**
     * Reactive stream of dashboard summary metrics.
     */
    val dashboardSummary: Flow<DashboardSummary> = combine(
        allPeople,
        allTransactions
    ) { people, transactions ->
        val summaries = people.map { person ->
            val personTxs = transactions.filter { it.personId == person.id }
            LedgerCalculator.calculatePersonBalance(person.id, personTxs, person.isSettled)
        }
        LedgerCalculator.calculateDashboardSummary(summaries)
    }

    suspend fun getPersonBalanceSummary(personId: Long): PersonBalanceSummary {
        val person = db.personDao().getPersonById(personId) ?: return PersonBalanceSummary(personId)
        val txs = db.transactionDao().getTransactionsForPersonSync(personId)
        return LedgerCalculator.calculatePersonBalance(personId, txs, person.isSettled)
    }

    suspend fun insertPerson(person: PersonEntity): Long = db.personDao().insertPerson(person)

    suspend fun updatePerson(person: PersonEntity) = db.personDao().updatePerson(person)

    suspend fun deletePerson(person: PersonEntity) = db.personDao().deletePerson(person)

    suspend fun insertTransaction(transaction: TransactionEntity): Long =
        db.transactionDao().insertTransaction(transaction)

    suspend fun deleteTransaction(transaction: TransactionEntity) =
        db.transactionDao().deleteTransaction(transaction)

    suspend fun markPersonSettled(personId: Long, finalAmount: Double, notes: String) {
        db.settlementDao().insertSettlement(
            SettlementEntity(
                personId = personId,
                amount = finalAmount,
                notes = notes
            )
        )
        db.personDao().updateSettlementStatus(personId, true)
    }

    suspend fun reopenPersonSettlement(personId: Long) {
        db.personDao().updateSettlementStatus(personId, false)
    }

    suspend fun insertReminder(reminder: ReminderEntity): Long =
        db.reminderDao().insertReminder(reminder)

    suspend fun updateReminderStatus(reminderId: Long, status: ReminderStatus) =
        db.reminderDao().updateStatus(reminderId, status)

    suspend fun seedSampleDataIfEmpty() {
        val count = db.personDao().getAllPeople().first()
        if (count.isNotEmpty()) return

        // 1. Rahul Sharma (Friend): Lent 10,000, Received 2,000, Interest 200 => Outstanding 8,200
        val rahulId = db.personDao().insertPerson(
            PersonEntity(
                name = "Rahul Sharma",
                phone = "+91 98765 43210",
                category = PersonCategory.FRIEND,
                notes = "College friend, emergency funds",
                defaultLanguage = Language.ENGLISH
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = rahulId,
                type = TransactionType.LEND,
                amount = 10000.0,
                description = "Emergency loan",
                paymentMethod = PaymentMethod.UPI,
                dueDate = System.currentTimeMillis() + 86400000L // Tomorrow
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = rahulId,
                type = TransactionType.PAYMENT_RECEIVED,
                amount = 2000.0,
                description = "Partial UPI transfer",
                paymentMethod = PaymentMethod.UPI
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = rahulId,
                type = TransactionType.INTEREST,
                amount = 200.0,
                description = "2% monthly interest",
                interestRate = 2.0,
                interestPeriod = InterestPeriod.MONTHLY
            )
        )

        // 2. Amit Verma (Relative): Borrowed 5,000, Repaid 1,500 => Liability 3,500
        val amitId = db.personDao().insertPerson(
            PersonEntity(
                name = "Amit Verma",
                phone = "+91 91234 56789",
                category = PersonCategory.RELATIVE,
                notes = "Cousin brother",
                defaultLanguage = Language.HINGLISH
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = amitId,
                type = TransactionType.BORROW,
                amount = 5000.0,
                description = "Family function advance",
                paymentMethod = PaymentMethod.CASH,
                dueDate = System.currentTimeMillis() + (3 * 86400000L) // 3 days
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = amitId,
                type = TransactionType.PAYMENT_MADE,
                amount = 1500.0,
                description = "Cash returned",
                paymentMethod = PaymentMethod.CASH
            )
        )

        // 3. Rohit Kumar (Customer): Outstanding 5,500
        val rohitId = db.personDao().insertPerson(
            PersonEntity(
                name = "Rohit Kumar",
                phone = "+91 99887 76655",
                category = PersonCategory.CUSTOMER,
                notes = "Kirana store regular bill",
                defaultLanguage = Language.HINDI
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                personId = rohitId,
                type = TransactionType.LEND,
                amount = 5500.0,
                description = "Pending grocery goods tab",
                paymentMethod = PaymentMethod.CASH,
                dueDate = System.currentTimeMillis() + (7 * 86400000L) // 7 days
            )
        )

        // Seed default templates
        db.messageTemplateDao().insertTemplate(
            MessageTemplateEntity(
                name = "English Polite",
                language = Language.ENGLISH,
                template = "Hi {name}, just a friendly reminder that ₹{amount} is currently outstanding on your Udhar account. Please confirm when convenient. Thank you.",
                isDefault = true
            )
        )
        db.messageTemplateDao().insertTemplate(
            MessageTemplateEntity(
                name = "Hindi Formal",
                language = Language.HINDI,
                template = "नमस्ते {name}, याद दिलाना था कि आपके खाते में ₹{amount} बाकी हैं। कृपया भुगतान की तारीख और राशि की पुष्टि कर दें। धन्यवाद।",
                isDefault = true
            )
        )
        db.messageTemplateDao().insertTemplate(
            MessageTemplateEntity(
                name = "Hinglish Casual",
                language = Language.HINGLISH,
                template = "Hi {name}, ₹{amount} abhi outstanding hain. Jab possible ho payment kar dena. Thanks!",
                isDefault = true
            )
        )
    }
}
