package com.udharmanager.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.udharmanager.app.MainActivity
import com.udharmanager.app.R
import com.udharmanager.app.data.database.UdharDatabase
import com.udharmanager.app.domain.calculator.LedgerCalculator
import kotlinx.coroutines.flow.first
import java.util.Locale

class ReminderWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val db = UdharDatabase.getInstance(context)
        val people = db.personDao().getAllPeople().first()
        val transactions = db.transactionDao().getAllTransactions().first()

        val now = System.currentTimeMillis()
        val oneDayMillis = 86400000L

        for (person in people) {
            if (person.isSettled) continue

            val personTxs = transactions.filter { it.personId == person.id }
            val balance = LedgerCalculator.calculatePersonBalance(person.id, personTxs, false)

            if (balance.outstandingOwedToUser > 0) {
                // Check if any transaction has due date soon or overdue
                val dueTx = personTxs.find { it.dueDate != null && it.dueDate!! <= (now + oneDayMillis) }
                if (dueTx != null) {
                    val isOverdue = dueTx.dueDate!! < now
                    val statusText = if (isOverdue) "Overdue payment" else "Due tomorrow"
                    showNotification(
                        context,
                        person.id.toInt(),
                        "🔔 Payment Reminder: ${person.name}",
                        "${person.name} has ₹${String.format(Locale.getDefault(), "%,.0f", balance.outstandingOwedToUser)} outstanding ($statusText)."
                    )
                }
            }
        }

        return Result.success()
    }

    private fun showNotification(context: Context, id: Int, title: String, content: String) {
        val channelId = "udhar_reminders_channel"
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Payment Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifies about pending loans, due dates and repayments"
            }
            manager.createNotificationChannel(channel)
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            id,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(content)
            .setStyle(NotificationCompat.BigTextStyle().bigText(content))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        manager.notify(id, notification)
    }
}
