package com.udharmanager.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.udharmanager.app.data.entities.*
import com.udharmanager.app.data.repository.UdharRepository
import com.udharmanager.app.domain.calculator.DashboardSummary
import com.udharmanager.app.domain.calculator.LedgerCalculator
import com.udharmanager.app.domain.calculator.PersonBalanceSummary
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PersonWithBalance(
    val person: PersonEntity,
    val summary: PersonBalanceSummary,
    val upcomingDueTx: TransactionEntity? = null
)

class UdharViewModel(private val repository: UdharRepository) : ViewModel() {

    val people: StateFlow<List<PersonEntity>> = repository.allPeople
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val transactions: StateFlow<List<TransactionEntity>> = repository.allTransactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val dashboardSummary: StateFlow<DashboardSummary> = repository.dashboardSummary
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardSummary())

    val templates: StateFlow<List<MessageTemplateEntity>> = repository.allTemplates
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val peopleWithBalances: StateFlow<List<PersonWithBalance>> = combine(
        people,
        transactions
    ) { peopleList, txList ->
        val now = System.currentTimeMillis()
        peopleList.map { person ->
            val personTxs = txList.filter { it.personId == person.id }
            val summary = LedgerCalculator.calculatePersonBalance(person.id, personTxs, person.isSettled)
            val upcomingDue = personTxs
                .filter { it.dueDate != null && it.dueDate!! >= (now - 86400000L) }
                .minByOrNull { it.dueDate!! }
            PersonWithBalance(person, summary, upcomingDue)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addPerson(
        name: String,
        phone: String,
        category: PersonCategory,
        notes: String,
        language: Language,
        onSuccess: (Long) -> Unit
    ) {
        viewModelScope.launch {
            val id = repository.insertPerson(
                PersonEntity(
                    name = name.trim(),
                    phone = phone.trim(),
                    category = category,
                    notes = notes.trim(),
                    defaultLanguage = language
                )
            )
            onSuccess(id)
        }
    }

    fun addTransaction(
        personId: Long,
        type: TransactionType,
        amount: Double,
        description: String,
        paymentMethod: PaymentMethod,
        dueDate: Long? = null,
        interestRate: Double = 0.0,
        interestPeriod: InterestPeriod = InterestPeriod.NONE,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            repository.insertTransaction(
                TransactionEntity(
                    personId = personId,
                    type = type,
                    amount = amount,
                    description = description.trim(),
                    paymentMethod = paymentMethod,
                    dueDate = dueDate,
                    interestRate = interestRate,
                    interestPeriod = interestPeriod
                )
            )
            // If person was settled and new transaction added, reopen
            repository.reopenPersonSettlement(personId)
            onSuccess()
        }
    }

    fun markSettled(personId: Long, finalAmount: Double, notes: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repository.markPersonSettled(personId, finalAmount, notes)
            onSuccess()
        }
    }

    fun deleteTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.deleteTransaction(transaction)
        }
    }

    fun deletePerson(person: PersonEntity) {
        viewModelScope.launch {
            repository.deletePerson(person)
        }
    }

    class Factory(private val repository: UdharRepository) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(UdharViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return UdharViewModel(repository) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
