package com.udharmanager.app

import android.app.Application
import androidx.work.*
import com.udharmanager.app.data.database.UdharDatabase
import com.udharmanager.app.data.repository.UdharRepository
import com.udharmanager.app.notifications.ReminderWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class UdharApplication : Application() {

    lateinit var repository: UdharRepository
        private set

    override fun onCreate() {
        super.onCreate()
        val database = UdharDatabase.getInstance(this)
        repository = UdharRepository(database)

        // Seed demo data on first launch
        CoroutineScope(Dispatchers.IO).launch {
            repository.seedSampleDataIfEmpty()
        }

        // Schedule periodic background reminder check using WorkManager
        setupReminderWorker()
    }

    private fun setupReminderWorker() {
        val workRequest = PeriodicWorkRequestBuilder<ReminderWorker>(6, TimeUnit.HOURS)
            .setConstraints(
                Constraints.Builder()
                    .setRequiresBatteryNotLow(true)
                    .build()
            )
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "UdharPaymentReminderWork",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }
}
