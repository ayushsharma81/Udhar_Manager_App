package com.udharmanager.app.domain.calculator

import com.udharmanager.app.data.entities.InterestPeriod
import com.udharmanager.app.data.entities.TransactionEntity
import com.udharmanager.app.data.entities.TransactionType
import kotlin.math.roundToLong

data class PersonBalanceSummary(
    val personId: Long,
    val totalLent: Double = 0.0,
    val totalReceived: Double = 0.0,
    val totalBorrowed: Double = 0.0,
    val totalRepaid: Double = 0.0,
    val totalInterestAccrued: Double = 0.0,
    val totalAdjustments: Double = 0.0,
    val outstandingOwedToUser: Double = 0.0, // Others owe me
    val liabilityOwedByUser: Double = 0.0,   // I owe others
    val netBalance: Double = 0.0,            // positive means person owes user
    val isSettled: Boolean = false
)

data class DashboardSummary(
    val othersOweMe: Double = 0.0,
    val iOweOthers: Double = 0.0,
    val netBalance: Double = 0.0,
    val totalInterestEarned: Double = 0.0,
    val totalInterestPaid: Double = 0.0
)

object LedgerCalculator {

    /**
     * Calculates the balance summary for a single person based on their complete transaction history.
     */
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

        // Calculation:
        // Outstanding (they owe me) = totalLent + (if lending primary, interest) - totalReceived + adjustments
        // Liability (I owe them) = totalBorrowed + (if borrow primary, interest) - totalRepaid - adjustments
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
            totalAdjustments = totalAdjustments,
            outstandingOwedToUser = if (isSettled) 0.0 else outstandingOwedToUser,
            liabilityOwedByUser = if (isSettled) 0.0 else liabilityOwedByUser,
            netBalance = if (isSettled) 0.0 else net,
            isSettled = isSettled
        )
    }

    /**
     * Computes dashboard aggregate metrics across all people.
     */
    fun calculateDashboardSummary(summaries: List<PersonBalanceSummary>): DashboardSummary {
        var othersOweMe = 0.0
        var iOweOthers = 0.0
        var totalInterestEarned = 0.0

        for (s in summaries) {
            if (!s.isSettled) {
                othersOweMe += s.outstandingOwedToUser
                iOweOthers += s.liabilityOwedByUser
                totalInterestEarned += s.totalInterestAccrued
            }
        }

        return DashboardSummary(
            othersOweMe = roundCurrency(othersOweMe),
            iOweOthers = roundCurrency(iOweOthers),
            netBalance = roundCurrency(othersOweMe - iOweOthers),
            totalInterestEarned = roundCurrency(totalInterestEarned),
            totalInterestPaid = 0.0
        )
    }

    /**
     * Calculate simple interest for a given period.
     * e.g. Principal ₹10,000, 2% monthly -> ₹200.
     */
    fun computeSimpleInterest(
        principal: Double,
        ratePercent: Double,
        period: InterestPeriod,
        monthsElapsed: Int = 1
    ): Double {
        if (principal <= 0 || ratePercent <= 0) return 0.0
        return when (period) {
            InterestPeriod.MONTHLY -> roundCurrency(principal * (ratePercent / 100.0) * monthsElapsed)
            InterestPeriod.YEARLY -> roundCurrency(principal * (ratePercent / 100.0) * (monthsElapsed / 12.0))
            InterestPeriod.CUSTOM, InterestPeriod.NONE -> roundCurrency(principal * (ratePercent / 100.0))
        }
    }

    fun roundCurrency(amount: Double): Double {
        return (amount * 100.0).roundToLong() / 100.0
    }
}
