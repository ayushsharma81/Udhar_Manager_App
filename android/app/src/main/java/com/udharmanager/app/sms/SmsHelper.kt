package com.udharmanager.app.sms

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class SmsSendResult(
    val success: Boolean,
    val methodUsed: String, // "DIRECT_SMS" or "COMPOSER_OPENED"
    val message: String
)

object SmsHelper {

    fun populateTemplate(
        template: String,
        name: String,
        amount: Double,
        dueDate: Long? = null,
        interest: Double = 0.0
    ): String {
        val dateStr = if (dueDate != null && dueDate > 0) {
            SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(Date(dueDate))
        } else {
            "soon"
        }

        val daysOverdue = if (dueDate != null && System.currentTimeMillis() > dueDate) {
            val diff = (System.currentTimeMillis() - dueDate) / (1000 * 60 * 60 * 24)
            "$diff days"
        } else {
            "0 days"
        }

        val formattedAmount = String.format(Locale.getDefault(), "%,.0f", amount)
        val formattedInterest = String.format(Locale.getDefault(), "%,.0f", interest)

        return template
            .replace("{name}", name)
            .replace("{amount}", formattedAmount)
            .replace("{due_date}", dateStr)
            .replace("{interest}", formattedInterest)
            .replace("{days_overdue}", daysOverdue)
    }

    /**
     * Attempts direct SMS if permission is held, otherwise opens native Android SMS Composer.
     * Never tells the user SMS was sent when it was only opened in composer!
     */
    fun sendOrComposeReminderSms(
        context: Context,
        phoneNumber: String,
        messageText: String
    ): SmsSendResult {
        val cleanPhone = phoneNumber.replace(" ", "").trim()

        val hasSendSmsPerm = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED

        if (hasSendSmsPerm) {
            return try {
                val smsManager: SmsManager = context.getSystemService(SmsManager::class.java)
                    ?: SmsManager.getDefault()
                val parts = smsManager.divideMessage(messageText)
                smsManager.sendMultipartTextMessage(cleanPhone, null, parts, null, null)
                SmsSendResult(
                    success = true,
                    methodUsed = "DIRECT_SMS",
                    message = "Direct SMS dispatched via carrier network"
                )
            } catch (e: Exception) {
                // Fall back to opening composer on carrier failure
                openSmsComposer(context, cleanPhone, messageText)
            }
        } else {
            return openSmsComposer(context, cleanPhone, messageText)
        }
    }

    fun openSmsComposer(
        context: Context,
        phoneNumber: String,
        messageText: String
    ): SmsSendResult {
        return try {
            val uri = Uri.parse("smsto:${Uri.encode(phoneNumber.replace(" ", ""))}")
            val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
                putExtra("sms_body", messageText)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            SmsSendResult(
                success = true,
                methodUsed = "COMPOSER_OPENED",
                message = "Android SMS composer opened with pre-filled details"
            )
        } catch (e: Exception) {
            SmsSendResult(
                success = false,
                methodUsed = "FAILED",
                message = "Failed to launch SMS composer: ${e.localizedMessage}"
            )
        }
    }
}
