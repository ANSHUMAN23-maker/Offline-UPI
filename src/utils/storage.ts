import { ContactItem, LanguageCode, SecurityQuestionsData, UserData, TransactionItem } from '../types';

const STORAGE_KEYS = {
  LANG: 'selected_language',
  LOGIN: 'isLogin',
  USER_DATA: 'UserData',
  PIN: 'PIN_CIPHER',
  SECURITY_QUESTIONS: 'security_questions',
  SELECTED_CONTACT: 'contactNumber',
  CONTACTS_LIST: 'contacts_list',
  BALANCE: 'account_balance',
  TRANSACTIONS: 'transactions_history',
  BIOMETRIC_ENABLED: 'offline_upi_biometric_enabled',
};

// Simple reversible cipher replicating AES/CBC string encryption for client persistence
export function encryptPin(pin: string): string {
  try {
    const salt = 'OfflineUPI_Keystore_Salt_';
    return btoa(unescape(encodeURIComponent(salt + pin)));
  } catch {
    return btoa(pin);
  }
}

export function decryptPin(cipher: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(cipher)));
    const salt = 'OfflineUPI_Keystore_Salt_';
    if (decoded.startsWith(salt)) {
      return decoded.replace(salt, '');
    }
    return decoded;
  } catch {
    try {
      return atob(cipher);
    } catch {
      return cipher;
    }
  }
}

export const DEFAULT_CONTACTS: ContactItem[] = [
  { id: '1', name: 'Aarav Sharma', number: '9876543210' },
  { id: '2', name: 'Priya Patel', number: '9823456789' },
  { id: '3', name: 'Rohan Verma', number: '9912345678' },
  { id: '4', name: 'Sneha Rao', number: '9765432109' },
  { id: '5', name: 'Ananya Deshmukh', number: '9890123456' },
  { id: '6', name: 'Vikram Singh', number: '9811223344' },
  { id: '7', name: 'Sahil Ingle', number: '9999999999' },
];

export const storage = {
  getLanguage(): LanguageCode {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as LanguageCode) || 'en';
  },

  setLanguage(lang: LanguageCode): void {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  },

  isRegistered(): boolean {
    const data = storage.getUserData();
    return Boolean(data.myPhone && data.myName);
  },

  isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.LOGIN) === 'true';
  },

  setLoggedIn(status: boolean): void {
    localStorage.setItem(STORAGE_KEYS.LOGIN, status ? 'true' : 'false');
  },

  getUserData(): UserData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return {
      myName: 'Sahil Ingle',
      myPhone: '9999999999',
      myUPIid: 'sahil@upi',
    };
  },

  setUserData(data: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  },

  getStoredPin(): string | null {
    const cipher = localStorage.getItem(STORAGE_KEYS.PIN);
    if (!cipher) return null;
    return decryptPin(cipher);
  },

  setPin(pin: string): void {
    const cipher = encryptPin(pin);
    localStorage.setItem(STORAGE_KEYS.PIN, cipher);
  },

  hasPin(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.PIN);
  },

  isBiometricEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return val === null ? true : val === 'true';
  },

  setBiometricEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },

  getSecurityQuestions(): SecurityQuestionsData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SECURITY_QUESTIONS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return null;
  },

  setSecurityQuestions(data: SecurityQuestionsData): void {
    localStorage.setItem(STORAGE_KEYS.SECURITY_QUESTIONS, JSON.stringify(data));
  },

  getSelectedContact(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CONTACT) || '';
  },

  setSelectedContact(number: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CONTACT, number);
  },

  clearSelectedContact(): void {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_CONTACT);
  },

  getContacts(): ContactItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS_LIST);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONTACTS;
  },

  addContact(contact: ContactItem): void {
    const list = this.getContacts();
    list.unshift(contact);
    localStorage.setItem(STORAGE_KEYS.CONTACTS_LIST, JSON.stringify(list));
  },

  getBalance(): number {
    const bal = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (bal) return parseFloat(bal);
    return 14850.50;
  },

  setBalance(amount: number): void {
    localStorage.setItem(STORAGE_KEYS.BALANCE, amount.toFixed(2));
  },

  deductBalance(amount: number): number {
    const current = this.getBalance();
    const updated = Math.max(0, current - amount);
    this.setBalance(updated);
    return updated;
  },

  addFunds(amount: number): number {
    const current = this.getBalance();
    const updated = current + amount;
    this.setBalance(updated);
    this.addTransaction('Funds Added to Account', amount, {
      status: 'success',
      mode: 'IN_APP_UPI',
      utr: `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
    });
    return updated;
  },

  getTransactions(): TransactionItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'TXN1001',
        date: '21 Sep 2026',
        time: '14:32',
        desc: 'Transfer to 9876543210',
        amount: 500,
        type: 'debit',
        payeeVpa: '9876543210@upi',
        utr: '220914321045',
        status: 'success',
        mode: 'IN_APP_UPI',
      },
      {
        id: 'TXN1002',
        date: '19 Sep 2026',
        time: '18:15',
        desc: 'UPI: priya@okaxis',
        amount: 1200,
        type: 'debit',
        payeeVpa: 'priya@okaxis',
        utr: '220918152391',
        status: 'success',
        mode: 'UPI_INTENT',
      },
      {
        id: 'TXN1003',
        date: '15 Sep 2026',
        time: '09:00',
        desc: 'Salary Credit',
        amount: 25000,
        type: 'credit',
        utr: '220909001289',
        status: 'success',
        mode: 'IN_APP_UPI',
      },
      {
        id: 'TXN1004',
        date: '12 Sep 2026',
        time: '11:45',
        desc: 'Bank Transfer SBIN000123',
        amount: 2000,
        type: 'debit',
        utr: '220911456721',
        status: 'success',
        mode: 'USSD_NUUP',
      },
    ];
  },

  addTransaction(
    desc: string,
    amount: number,
    details?: {
      payeeVpa?: string;
      utr?: string;
      mode?: 'UPI_INTENT' | 'IN_APP_UPI' | 'USSD_NUUP';
      status?: 'success' | 'failed' | 'pending';
      type?: 'debit' | 'credit';
    }
  ): TransactionItem {
    const list = this.getTransactions();
    const now = new Date();
    const newTxn: TransactionItem = {
      id: `UPI${Math.floor(100000 + Math.random() * 900000)}`,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      desc,
      amount,
      type: details?.type || (desc.toLowerCase().includes('credit') ? 'credit' : 'debit'),
      payeeVpa: details?.payeeVpa,
      utr: details?.utr || `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
      status: details?.status || 'success',
      mode: details?.mode || 'IN_APP_UPI',
    };
    list.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.slice(0, 30)));
    return newTxn;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGIN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.PIN);
    localStorage.removeItem(STORAGE_KEYS.SECURITY_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_CONTACT);
  },
};
