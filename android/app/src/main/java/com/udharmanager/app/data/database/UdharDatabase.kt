package com.udharmanager.app.data.database

import android.content.Context
import androidx.room.*
import com.udharmanager.app.data.dao.*
import com.udharmanager.app.data.entities.*

class Converters {
    @TypeConverter
    fun fromPersonCategory(value: PersonCategory): String = value.name

    @TypeConverter
    fun toPersonCategory(value: String): PersonCategory = PersonCategory.valueOf(value)

    @TypeConverter
    fun fromTransactionType(value: TransactionType): String = value.name

    @TypeConverter
    fun toTransactionType(value: String): TransactionType = TransactionType.valueOf(value)

    @TypeConverter
    fun fromPaymentMethod(value: PaymentMethod): String = value.name

    @TypeConverter
    fun toPaymentMethod(value: String): PaymentMethod = PaymentMethod.valueOf(value)

    @TypeConverter
    fun fromInterestPeriod(value: InterestPeriod): String = value.name

    @TypeConverter
    fun toInterestPeriod(value: String): InterestPeriod = InterestPeriod.valueOf(value)

    @TypeConverter
    fun fromReminderStatus(value: ReminderStatus): String = value.name

    @TypeConverter
    fun toReminderStatus(value: String): ReminderStatus = ReminderStatus.valueOf(value)

    @TypeConverter
    fun fromReminderType(value: ReminderType): String = value.name

    @TypeConverter
    fun toReminderType(value: String): ReminderType = ReminderType.valueOf(value)

    @TypeConverter
    fun fromLanguage(value: Language): String = value.name

    @TypeConverter
    fun toLanguage(value: String): Language = Language.valueOf(value)
}

@Database(
    entities = [
        PersonEntity::class,
        TransactionEntity::class,
        ReminderEntity::class,
        MessageTemplateEntity::class,
        SettlementEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class UdharDatabase : RoomDatabase() {

    abstract fun personDao(): PersonDao
    abstract fun transactionDao(): TransactionDao
    abstract fun reminderDao(): ReminderDao
    abstract fun messageTemplateDao(): MessageTemplateDao
    abstract fun settlementDao(): SettlementDao

    companion object {
        @Volatile
        private var INSTANCE: UdharDatabase? = null

        fun getInstance(context: Context): UdharDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    UdharDatabase::class.java,
                    "udhar_manager.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
