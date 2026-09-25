import { MessageTemplate, Person, Reminder, Settlement, Transaction } from '../types';
import { DEFAULT_TEMPLATES } from './templates';

const STORAGE_KEYS = {
  PEOPLE: 'udhar_people',
  TRANSACTIONS: 'udhar_transactions',
  REMINDERS: 'udhar_reminders',
  TEMPLATES: 'udhar_templates',
  SETTLEMENTS: 'udhar_settlements',
  PIN: 'udhar_pin_code',
  DARK_MODE: 'udhar_dark_mode',
  FIRST_LAUNCH: 'udhar_first_launch_done',
};

// Initial test cases & data requested:
// Rahul Sharma: Lent ₹10,000, Received ₹2,000, Interest ₹200 => Outstanding ₹8,200 (Due tomorrow)
// Amit Verma: Borrowed ₹5,000, Repaid ₹1,500 => Liability ₹3,500 (Due 28 Sep)
// Rohit Kumar: Customer, Outstanding ₹5,500 (Due 2 Oct)
// Extra customer/friend to make overall figures impressive and realistic
export const SEED_PEOPLE: Person[] = [
  {
    id: 'p-rahul',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    category: 'FRIEND',
    notes: 'College friend, loaned for medical emergency',
    defaultLanguage: 'ENGLISH',
    isSettled: false,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'p-amit',
    name: 'Amit Verma',
    phone: '+91 98123 45678',
    category: 'RELATIVE',
    notes: 'Cousin brother, borrowed during family event',
    defaultLanguage: 'HINGLISH',
    isSettled: false,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'p-rohit',
    name: 'Rohit Kumar',
    phone: '+91 99887 76655',
    category: 'CUSTOMER',
    notes: 'Wholesale supplies bill credit',
    defaultLanguage: 'HINDI',
    isSettled: false,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'p-neha',
    name: 'Neha Gupta',
    phone: '+91 94567 89012',
    category: 'MERCHANT',
    notes: 'Raw material fabric supplier credit',
    defaultLanguage: 'ENGLISH',
    isSettled: false,
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'p-vikram',
    name: 'Vikram Singh',
    phone: '+91 97654 32109',
    category: 'FRIEND',
    notes: 'Office colleague personal loan',
    defaultLanguage: 'ENGLISH',
    isSettled: false,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now(),
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  // Rahul Sharma: Lent 10,000, Received 2,000, Interest 200 => Outstanding 8,200
  {
    id: 'tx-1',
    personId: 'p-rahul',
    type: 'LEND',
    amount: 10000,
    date: Date.now() - 14 * 86400000,
    description: 'Personal emergency loan',
    paymentMethod: 'UPI',
    dueDate: Date.now() + 86400000, // Tomorrow
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'tx-2',
    personId: 'p-rahul',
    type: 'PAYMENT_RECEIVED',
    amount: 2000,
    date: Date.now() - 7 * 86400000,
    description: 'First installment via GPay',
    paymentMethod: 'UPI',
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'tx-3',
    personId: 'p-rahul',
    type: 'INTEREST',
    amount: 200,
    date: Date.now() - 1 * 86400000,
    description: '2% monthly interest accrued',
    paymentMethod: 'OTHER',
    interestRate: 2,
    interestPeriod: 'MONTHLY',
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },

  // Amit Verma: Borrowed 5,000, Repaid 1,500 => Liability 3,500
  {
    id: 'tx-4',
    personId: 'p-amit',
    type: 'BORROW',
    amount: 5000,
    date: Date.now() - 18 * 86400000,
    description: 'Family function expense advance',
    paymentMethod: 'CASH',
    dueDate: Date.now() + 3 * 86400000, // 3 days
    createdAt: Date.now() - 18 * 86400000,
    updatedAt: Date.now() - 18 * 86400000,
  },
  {
    id: 'tx-5',
    personId: 'p-amit',
    type: 'PAYMENT_MADE',
    amount: 1500,
    date: Date.now() - 4 * 86400000,
    description: 'Cash returned partial',
    paymentMethod: 'CASH',
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },

  // Rohit Kumar: Outstanding 5,500 (Customer)
  {
    id: 'tx-6',
    personId: 'p-rohit',
    type: 'LEND',
    amount: 5500,
    date: Date.now() - 9 * 86400000,
    description: 'Bulk store purchase on credit',
    paymentMethod: 'CASH',
    dueDate: Date.now() + 7 * 86400000, // 7 days
    createdAt: Date.now() - 9 * 86400000,
    updatedAt: Date.now() - 9 * 86400000,
  },

  // Vikram Singh: Lent 20,000, Received 1,000, Interest 1,040 => Outstanding 20,040
  {
    id: 'tx-7',
    personId: 'p-vikram',
    type: 'LEND',
    amount: 20000,
    date: Date.now() - 25 * 86400000,
    description: 'Laptop purchase assistance',
    paymentMethod: 'BANK_TRANSFER',
    dueDate: Date.now() + 14 * 86400000,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'tx-8',
    personId: 'p-vikram',
    type: 'PAYMENT_RECEIVED',
    amount: 1000,
    date: Date.now() - 10 * 86400000,
    description: 'Direct bank transfer',
    paymentMethod: 'BANK_TRANSFER',
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'tx-9',
    personId: 'p-vikram',
    type: 'INTEREST',
    amount: 1040,
    date: Date.now() - 2 * 86400000,
    description: 'Interest accrued',
    paymentMethod: 'OTHER',
    interestRate: 2.5,
    interestPeriod: 'MONTHLY',
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },

  // Neha Gupta: Borrowed 3,050 (Merchant)
  {
    id: 'tx-10',
    personId: 'p-neha',
    type: 'BORROW',
    amount: 3050,
    date: Date.now() - 3 * 86400000,
    description: 'Shortage payment for goods delivered',
    paymentMethod: 'UPI',
    dueDate: Date.now() + 5 * 86400000,
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
];

export class StorageService {
  static getPeople(): Person[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!raw) {
      this.savePeople(SEED_PEOPLE);
      return SEED_PEOPLE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PEOPLE;
    }
  }

  static savePeople(people: Person[]): void {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  }

  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      this.saveTransactions(SEED_TRANSACTIONS);
      return SEED_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_TRANSACTIONS;
    }
  }

  static saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  static getReminders(): Reminder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveReminders(reminders: Reminder[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  static getTemplates(): MessageTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      this.saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TEMPLATES;
    }
  }

  static saveTemplates(templates: MessageTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static getSettlements(): Settlement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveSettlements(settlements: Settlement[]): void {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }

  static getPin(): string | null {
    return localStorage.getItem(STORAGE_KEYS.PIN);
  }

  static setPin(pin: string | null): void {
    if (pin) {
      localStorage.setItem(STORAGE_KEYS.PIN, pin);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PIN);
    }
  }

  static resetToSampleData(): void {
    this.savePeople(SEED_PEOPLE);
    this.saveTransactions(SEED_TRANSACTIONS);
    this.saveTemplates(DEFAULT_TEMPLATES);
    this.saveReminders([]);
    this.saveSettlements([]);
  }

  static clearAllData(): void {
    this.savePeople([]);
    this.saveTransactions([]);
    this.saveReminders([]);
    this.saveSettlements([]);
  }

  static exportFullBackupJson(): string {
    const data = {
      version: 1,
      appName: 'Udhar Manager',
      exportedAt: new Date().toISOString(),
      people: this.getPeople(),
      transactions: this.getTransactions(),
      reminders: this.getReminders(),
      templates: this.getTemplates(),
      settlements: this.getSettlements(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.people)) this.savePeople(data.people);
      if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
      if (Array.isArray(data.reminders)) this.saveReminders(data.reminders);
      if (Array.isArray(data.templates)) this.saveTemplates(data.templates);
      if (Array.isArray(data.settlements)) this.saveSettlements(data.settlements);
      return true;
    } catch {
      return false;
    }
  }
}
