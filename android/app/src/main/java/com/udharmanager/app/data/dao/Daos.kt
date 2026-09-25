package com.udharmanager.app.data.dao

import androidx.room.*
import com.udharmanager.app.data.entities.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PersonDao {
    @Query("SELECT * FROM people ORDER BY name ASC")
    fun getAllPeople(): Flow<List<PersonEntity>>

    @Query("SELECT * FROM people WHERE id = :id")
    suspend fun getPersonById(id: Long): PersonEntity?

    @Query("SELECT * FROM people WHERE id = :id")
    fun getPersonFlow(id: Long): Flow<PersonEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPerson(person: PersonEntity): Long

    @Update
    suspend fun updatePerson(person: PersonEntity)

    @Delete
    suspend fun deletePerson(person: PersonEntity)

    @Query("UPDATE people SET isSettled = :isSettled WHERE id = :id")
    suspend fun updateSettlementStatus(id: Long, isSettled: Boolean)
}

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY date DESC, id DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE personId = :personId ORDER BY date DESC, id DESC")
    fun getTransactionsForPerson(personId: Long): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE personId = :personId ORDER BY date ASC, id ASC")
    suspend fun getTransactionsForPersonSync(personId: Long): List<TransactionEntity>

    @Query("SELECT * FROM transactions WHERE dueDate IS NOT NULL ORDER BY dueDate ASC")
    fun getTransactionsWithDueDate(): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity): Long

    @Update
    suspend fun updateTransaction(transaction: TransactionEntity)

    @Delete
    suspend fun deleteTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE personId = :personId")
    suspend fun deleteTransactionsForPerson(personId: Long)
}

@Dao
interface ReminderDao {
    @Query("SELECT * FROM reminders ORDER BY scheduledAt ASC")
    fun getAllReminders(): Flow<List<ReminderEntity>>

    @Query("SELECT * FROM reminders WHERE personId = :personId ORDER BY scheduledAt DESC")
    fun getRemindersForPerson(personId: Long): Flow<List<ReminderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: ReminderEntity): Long

    @Update
    suspend fun updateReminder(reminder: ReminderEntity)

    @Query("UPDATE reminders SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: Long, status: ReminderStatus)
}

@Dao
interface MessageTemplateDao {
    @Query("SELECT * FROM message_templates ORDER BY isDefault DESC, name ASC")
    fun getAllTemplates(): Flow<List<MessageTemplateEntity>>

    @Query("SELECT * FROM message_templates WHERE language = :language AND isDefault = 1 LIMIT 1")
    suspend fun getDefaultTemplateForLanguage(language: Language): MessageTemplateEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplate(template: MessageTemplateEntity): Long

    @Update
    suspend fun updateTemplate(template: MessageTemplateEntity)

    @Delete
    suspend fun deleteTemplate(template: MessageTemplateEntity)
}

@Dao
interface SettlementDao {
    @Query("SELECT * FROM settlements WHERE personId = :personId ORDER BY settledAt DESC")
    fun getSettlementsForPerson(personId: Long): Flow<List<SettlementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSettlement(settlement: SettlementEntity): Long
}
