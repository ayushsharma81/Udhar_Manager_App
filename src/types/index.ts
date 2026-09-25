export type PersonCategory = 'FRIEND' | 'RELATIVE' | 'CUSTOMER' | 'MERCHANT' | 'OTHER';

export type TransactionType =
  | 'LEND'             // User gives money to other person
  | 'BORROW'           // User takes money from other person
  | 'PAYMENT_RECEIVED' // Other person pays user back
  | 'PAYMENT_MADE'     // User pays other person back
  | 'INTEREST'         // Interest added
  | 'ADJUSTMENT';      // Manual correction

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export type InterestPeriod = 'NONE' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export type Language = 'ENGLISH' | 'HINDI' | 'HINGLISH' | 'CUSTOM';

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'SMS_COMPOSER_OPENED' | 'FAILED' | 'CANCELLED';

export interface Person {
  id: string;
  name: string;
  phone: string;
  category: PersonCategory;
  notes: string;
  defaultLanguage: Language;
  isSettled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  date: number;
  description: string;
  paymentMethod: PaymentMethod;
  interestRate?: number;
  interestPeriod?: InterestPeriod;
  dueDate?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  personId: string;
  transactionId?: string;
  amount: number;
  message: string;
  scheduledAt: number;
  status: ReminderStatus;
  type: 'SMS' | 'NOTIFICATION' | 'WHATSAPP';
  createdAt: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  language: Language;
  template: string;
  isDefault: boolean;
  createdAt: number;
}

export interface Settlement {
  id: string;
  personId: string;
  amount: number;
  settledAt: number;
  notes: string;
}

export interface PersonBalanceSummary {
  personId: string;
  totalLent: number;
  totalReceived: number;
  totalBorrowed: number;
  totalRepaid: number;
  totalInterestAccrued: number;
  totalAdjustments: number;
  outstandingOwedToUser: number; // Others owe me
  liabilityOwedByUser: number;   // I owe others
  netBalance: number;            // positive = they owe me, negative = I owe them
  isSettled: boolean;
}

export interface DashboardMetrics {
  othersOweMe: number;
  iOweOthers: number;
  netBalance: number;
  totalInterestEarned: number;
}
