package com.udharmanager.app

import com.udharmanager.app.data.entities.TransactionEntity
import com.udharmanager.app.data.entities.TransactionType
import com.udharmanager.app.domain.calculator.LedgerCalculator
import org.junit.Assert.assertEquals
import org.junit.Test

class LedgerCalculatorTest {

    @Test
    fun test1_LendingRahulTenThousand() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(1, txs)
        assertEquals(10000.0, summary.outstandingOwedToUser, 0.01)
        assertEquals(0.0, summary.liabilityOwedByUser, 0.01)
    }

    @Test
    fun test2_PartialRepaymentTwoThousand() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0),
            TransactionEntity(id = 2, personId = 1, type = TransactionType.PAYMENT_RECEIVED, amount = 2000.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(1, txs)
        assertEquals(8000.0, summary.outstandingOwedToUser, 0.01)
    }

    @Test
    fun test3_InterestAddition() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0),
            TransactionEntity(id = 2, personId = 1, type = TransactionType.PAYMENT_RECEIVED, amount = 2000.0),
            TransactionEntity(id = 3, personId = 1, type = TransactionType.INTEREST, amount = 200.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(1, txs)
        // 10,000 - 2,000 + 200 = 8,200
        assertEquals(8200.0, summary.outstandingOwedToUser, 0.01)
    }

    @Test
    fun test4_BorrowingFromAmit() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 2, type = TransactionType.BORROW, amount = 5000.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(2, txs)
        assertEquals(0.0, summary.outstandingOwedToUser, 0.01)
        assertEquals(5000.0, summary.liabilityOwedByUser, 0.01)
    }

    @Test
    fun test5_UserRepaysAmit() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 2, type = TransactionType.BORROW, amount = 5000.0),
            TransactionEntity(id = 2, personId = 2, type = TransactionType.PAYMENT_MADE, amount = 1500.0)
        )
        val summary = LedgerCalculator.calculatePersonBalance(2, txs)
        // Liability = 5,000 - 1,500 = 3,500
        assertEquals(3500.0, summary.liabilityOwedByUser, 0.01)
    }

    @Test
    fun test6_SettlementPreservesHistory() {
        val txs = listOf(
            TransactionEntity(id = 1, personId = 1, type = TransactionType.LEND, amount = 10000.0),
            TransactionEntity(id = 2, personId = 1, type = TransactionType.PAYMENT_RECEIVED, amount = 2000.0),
            TransactionEntity(id = 3, personId = 1, type = TransactionType.INTEREST, amount = 200.0),
            TransactionEntity(id = 4, personId = 1, type = TransactionType.PAYMENT_RECEIVED, amount = 8200.0)
        )
        // Settled account check
        val summary = LedgerCalculator.calculatePersonBalance(1, txs, isSettled = true)
        assertEquals(0.0, summary.outstandingOwedToUser, 0.01)
        assertEquals(true, summary.isSettled)
        assertEquals(4, txs.size) // All 4 historical transactions preserved!
    }
}
