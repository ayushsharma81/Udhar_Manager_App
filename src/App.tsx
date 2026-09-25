import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { FabSheet } from './components/FabSheet';
import { SmsComposerModal } from './components/SmsComposerModal';
import { NotificationBanner, NotificationItem } from './components/NotificationBanner';
import { PinLockModal } from './components/PinLockModal';
import { SourceInspectorModal } from './components/SourceInspectorModal';
import { HomeView } from './views/HomeView';
import { PeopleView } from './views/PeopleView';
import { PersonDetailView } from './views/PersonDetailView';
import { TransactionsView } from './views/TransactionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { AddTransactionModal } from './views/AddTransactionModal';
import { AddPersonModal } from './views/AddPersonModal';
import { SettlementModal } from './views/SettlementModal';
import { Language, MessageTemplate, PaymentMethod, Person, PersonCategory, Transaction, TransactionType } from './types';
import { StorageService } from './utils/storage';
import { calculatePersonBalance, formatRupee } from './utils/calculator';
import { Plus } from 'lucide-react';

export default function App() {
  // App state
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [pin, setPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Modals & Sheets
  const [isFabSheetOpen, setIsFabSheetOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [addTxPreselectedType, setAddTxPreselectedType] = useState<TransactionType>('LEND');
  const [addTxPreselectedPersonId, setAddTxPreselectedPersonId] = useState<string | undefined>(undefined);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [settlementPerson, setSettlementPerson] = useState<Person | null>(null);
  const [isSmsComposerOpen, setIsSmsComposerOpen] = useState(false);
  const [smsTargetPerson, setSmsTargetPerson] = useState<Person | null>(null);
  const [smsAmount, setSmsAmount] = useState<number>(0);
  const [smsDueDate, setSmsDueDate] = useState<number | null>(null);
  const [isSourceInspectorOpen, setIsSourceInspectorOpen] = useState(false);

  // Notifications
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  // Load Initial Data
  useEffect(() => {
    const loadedPeople = StorageService.getPeople();
    const loadedTxs = StorageService.getTransactions();
    const loadedTemplates = StorageService.getTemplates();
    const loadedPin = StorageService.getPin();

    setPeople(loadedPeople);
    setTransactions(loadedTxs);
    setTemplates(loadedTemplates);
    setPin(loadedPin);

    if (loadedPin) {
      setIsLocked(true);
    }

    // Trigger an initial payment due reminder simulation for demo
    const rahul = loadedPeople.find((p) => p.name.includes('Rahul'));
    if (rahul) {
      setTimeout(() => {
        setActiveNotification({
          id: 'notif-due-rahul',
          title: 'Payment Due Tomorrow',
          message: 'Rahul Sharma has ₹8,200 outstanding scheduled for tomorrow.',
          personId: rahul.id,
          amount: 8200,
        });
      }, 1500);
    }
  }, []);

  // Save changes
  const updatePeople = (newPeople: Person[]) => {
    setPeople(newPeople);
    StorageService.savePeople(newPeople);
  };

  const updateTransactions = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    StorageService.saveTransactions(newTxs);
  };

  const updateTemplates = (newTemplates: MessageTemplate[]) => {
    setTemplates(newTemplates);
    StorageService.saveTemplates(newTemplates);
  };

  const handleSetPin = (newPin: string | null) => {
    setPin(newPin);
    StorageService.setPin(newPin);
  };

  // Add new Person
  const handleSavePerson = (data: {
    name: string;
    phone: string;
    category: PersonCategory;
    notes: string;
    defaultLanguage: Language;
  }) => {
    const newPerson: Person = {
      id: `p-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      category: data.category,
      notes: data.notes,
      defaultLanguage: data.defaultLanguage,
      isSettled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newPerson, ...people];
    updatePeople(updated);
  };

  // Add new Transaction
  const handleSaveTransaction = (data: {
    personId: string;
    type: TransactionType;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    interestRate?: number;
    interestPeriod?: any;
    dueDate?: number | null;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      personId: data.personId,
      type: data.type,
      amount: data.amount,
      date: Date.now(),
      description: data.description,
      paymentMethod: data.paymentMethod,
      interestRate: data.interestRate,
      interestPeriod: data.interestPeriod,
      dueDate: data.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedTxs = [newTx, ...transactions];
    updateTransactions(updatedTxs);

    // Reopen person settlement status if new transaction is added
    const updatedPeople = people.map((p) =>
      p.id === data.personId ? { ...p, isSettled: false, updatedAt: Date.now() } : p
    );
    updatePeople(updatedPeople);

    // If person detail is open, keep selectedPerson in sync
    if (selectedPerson && selectedPerson.id === data.personId) {
      setSelectedPerson({ ...selectedPerson, isSettled: false });
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (tx: Transaction) => {
    const updated = transactions.filter((t) => t.id !== tx.id);
    updateTransactions(updated);
  };

  // Settle Account
  const handleConfirmSettlement = (finalAmount: number, notes: string) => {
    if (!settlementPerson) return;
    const updatedPeople = people.map((p) =>
      p.id === settlementPerson.id ? { ...p, isSettled: true, updatedAt: Date.now() } : p
    );
    updatePeople(updatedPeople);

    // Record settlement entity
    const settlements = StorageService.getSettlements();
    StorageService.saveSettlements([
      ...settlements,
      {
        id: `set-${Date.now()}`,
        personId: settlementPerson.id,
        amount: finalAmount,
        settledAt: Date.now(),
        notes,
      },
    ]);

    if (selectedPerson && selectedPerson.id === settlementPerson.id) {
      setSelectedPerson({ ...selectedPerson, isSettled: true });
    }
  };

  // SMS Flow
  const handleTriggerSendReminder = (
    person: Person,
    amount: number,
    dueDate?: number | null
  ) => {
    setSmsTargetPerson(person);
    setSmsAmount(amount);
    setSmsDueDate(dueDate || null);
    setIsSmsComposerOpen(true);
  };

  // Reset to initial test cases
  const handleResetData = () => {
    StorageService.resetToSampleData();
    setPeople(StorageService.getPeople());
    setTransactions(StorageService.getTransactions());
    setTemplates(StorageService.getTemplates());
    setSelectedPerson(null);
  };

  const handleClearData = () => {
    StorageService.clearAllData();
    setPeople([]);
    setTransactions([]);
    setSelectedPerson(null);
  };

  // Pending due notifications count
  const now = Date.now();
  const pendingDueCount = people.filter((p) => {
    if (p.isSettled) return false;
    const pTxs = transactions.filter((t) => t.personId === p.id);
    const hasDueSoon = pTxs.some((t) => t.dueDate != null && t.dueDate <= now + 86400000);
    return hasDueSoon;
  }).length;

  return (
    <AndroidFrame
      onOpenSourceInspector={() => setIsSourceInspectorOpen(true)}
      isDarkMode={isDarkMode}
    >
      {/* Heads-up Android notification */}
      <NotificationBanner
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        onAction={(notif) => {
          setActiveNotification(null);
          const p = people.find((item) => item.id === notif.personId);
          if (p) {
            handleTriggerSendReminder(p, notif.amount || 0, null);
          }
        }}
        isDarkMode={isDarkMode}
      />

      {/* Security PIN Lock Screen */}
      {isLocked && pin && (
        <PinLockModal
          storedPin={pin}
          onUnlocked={() => setIsLocked(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Main Android App Layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top App Bar */}
        <TopBar
          title={
            selectedPerson
              ? selectedPerson.name
              : activeTab === 'home'
              ? 'Udhar Manager'
              : activeTab === 'people'
              ? 'People'
              : activeTab === 'transactions'
              ? 'Transactions'
              : activeTab === 'analytics'
              ? 'Analytics'
              : 'Settings'
          }
          subtitle={activeTab === 'home' ? 'PRO LEDGER' : undefined}
          isDarkMode={isDarkMode}
          onOpenSearch={() => {
            setSelectedPerson(null);
            setActiveTab('people');
          }}
          onOpenNotifications={() => {
            const nextDuePerson = people.find((p) => {
              const summary = calculatePersonBalance(p.id, transactions, p.isSettled);
              return !p.isSettled && summary.outstandingOwedToUser > 0;
            });
            if (nextDuePerson) {
              const summary = calculatePersonBalance(nextDuePerson.id, transactions, false);
              setActiveNotification({
                id: `notif-${Date.now()}`,
                title: 'Pending Loan Reminder',
                message: `${nextDuePerson.name} has ${formatRupee(summary.outstandingOwedToUser)} outstanding.`,
                personId: nextDuePerson.id,
                amount: summary.outstandingOwedToUser,
              });
            }
          }}
          onOpenSourceInspector={() => setIsSourceInspectorOpen(true)}
          pendingDueCount={pendingDueCount}
        />

        {/* View Routing */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {selectedPerson ? (
            <PersonDetailView
              person={selectedPerson}
              transactions={transactions}
              onBack={() => setSelectedPerson(null)}
              onSendReminder={(p, amt, due) => handleTriggerSendReminder(p, amt, due)}
              onOpenAddTransaction={(type, personId) => {
                setAddTxPreselectedType(type);
                setAddTxPreselectedPersonId(personId);
                setIsAddTxOpen(true);
              }}
              onOpenSettlement={(p) => {
                setSettlementPerson(p);
                setIsSettlementOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onDeletePerson={(p) => {
                updatePeople(people.filter((item) => item.id !== p.id));
                updateTransactions(transactions.filter((t) => t.personId !== p.id));
                setSelectedPerson(null);
              }}
              isDarkMode={isDarkMode}
            />
          ) : activeTab === 'home' ? (
            <HomeView
              people={people}
              transactions={transactions}
              onOpenAddTransaction={(type, personId) => {
                if (type) setAddTxPreselectedType(type);
                setAddTxPreselectedPersonId(personId);
                setIsAddTxOpen(true);
              }}
              onOpenAddPerson={() => setIsAddPersonOpen(true)}
              onOpenPersonDetail={(p) => setSelectedPerson(p)}
              onSendReminder={(p, amt, due) => handleTriggerSendReminder(p, amt, due)}
              onNavigateTab={(tab) => {
                setSelectedPerson(null);
                setActiveTab(tab);
              }}
              isDarkMode={isDarkMode}
            />
          ) : activeTab === 'people' ? (
            <PeopleView
              people={people}
              transactions={transactions}
              onOpenAddPerson={() => setIsAddPersonOpen(true)}
              onSelectPerson={(p) => setSelectedPerson(p)}
              isDarkMode={isDarkMode}
            />
          ) : activeTab === 'transactions' ? (
            <TransactionsView
              transactions={transactions}
              people={people}
              onOpenAddTransaction={() => {
                setAddTxPreselectedType('LEND');
                setAddTxPreselectedPersonId(undefined);
                setIsAddTxOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              isDarkMode={isDarkMode}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsView
              people={people}
              transactions={transactions}
              isDarkMode={isDarkMode}
            />
          ) : (
            <SettingsView
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              hasPin={Boolean(pin)}
              onSetPin={handleSetPin}
              templates={templates}
              onUpdateTemplates={updateTemplates}
              onResetData={handleResetData}
              onClearData={handleClearData}
              onOpenSourceInspector={() => setIsSourceInspectorOpen(true)}
            />
          )}

          {/* Native Android Floating Action Button (FAB) */}
          {!selectedPerson && (
            <button
              onClick={() => setIsFabSheetOpen(true)}
              className="absolute right-5 bottom-5 z-20 w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-950/50 flex items-center justify-center transition-all duration-200 active:scale-90"
              title="Quick Action"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedPerson(null);
            setActiveTab(tab);
          }}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* FAB Quick Action Bottom Sheet */}
      <FabSheet
        isOpen={isFabSheetOpen}
        onClose={() => setIsFabSheetOpen(false)}
        onOpenAddTransaction={(type) => {
          setAddTxPreselectedType(type);
          setAddTxPreselectedPersonId(undefined);
          setIsAddTxOpen(true);
        }}
        onOpenAddPerson={() => setIsAddPersonOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        people={people}
        preselectedPersonId={addTxPreselectedPersonId}
        initialType={addTxPreselectedType}
        onSaveTransaction={handleSaveTransaction}
        isDarkMode={isDarkMode}
      />

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        onSavePerson={handleSavePerson}
        isDarkMode={isDarkMode}
      />

      {/* Settlement Modal */}
      {settlementPerson && (
        <SettlementModal
          isOpen={isSettlementOpen}
          onClose={() => {
            setIsSettlementOpen(false);
            setSettlementPerson(null);
          }}
          person={settlementPerson}
          transactions={transactions}
          onConfirmSettlement={handleConfirmSettlement}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SMS Reminder Composer Modal */}
      {smsTargetPerson && (
        <SmsComposerModal
          isOpen={isSmsComposerOpen}
          onClose={() => {
            setIsSmsComposerOpen(false);
            setSmsTargetPerson(null);
          }}
          person={smsTargetPerson}
          outstandingAmount={smsAmount}
          dueDate={smsDueDate}
          templates={templates}
          onLogReminder={(status, message) => {
            const reminders = StorageService.getReminders();
            StorageService.saveReminders([
              ...reminders,
              {
                id: `rem-${Date.now()}`,
                personId: smsTargetPerson.id,
                amount: smsAmount,
                message,
                scheduledAt: Date.now(),
                status,
                type: 'SMS',
                createdAt: Date.now(),
              },
            ]);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Android Kotlin & Gradle Source Inspector Modal */}
      <SourceInspectorModal
        isOpen={isSourceInspectorOpen}
        onClose={() => setIsSourceInspectorOpen(false)}
        isDarkMode={isDarkMode}
      />
    </AndroidFrame>
  );
}
