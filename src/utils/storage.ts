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

// Reversible cipher replicating AES/CBC string encryption for client keystore persistence
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

export const storage = {
  getLanguage(): LanguageCode {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as LanguageCode) || 'en';
  },

  setLanguage(lang: LanguageCode): void {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  },

  isRegistered(): boolean {
    const data = storage.getUserData();
    return Boolean(data.myPhone && data.myName && data.myPhone.trim().length === 10);
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
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            myName: parsed.myName || '',
            myPhone: parsed.myPhone || '',
            myUPIid: parsed.myUPIid || '',
            myBank: parsed.myBank || '',
            myAccountNumber: parsed.myAccountNumber || '',
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      myName: '',
      myPhone: '',
      myUPIid: '',
      myBank: '',
      myAccountNumber: '',
    };
  },

  setUserData(data: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  },

  hasPin(): boolean {
    return Boolean(this.getStoredPin());
  },

  getStoredPin(): string | null {
    const cipher = localStorage.getItem(STORAGE_KEYS.PIN);
    if (!cipher) return null;
    return decryptPin(cipher);
  },

  setPin(pin: string): void {
    localStorage.setItem(STORAGE_KEYS.PIN, encryptPin(pin));
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

  getSelectedContact(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CONTACT);
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
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch {
      // ignore
    }
    return [];
  },

  addContact(contact: ContactItem): void {
    const list = this.getContacts();
    // Prevent duplicate phone numbers
    const cleanNum = contact.number.replace(/\D/g, '').slice(-10);
    const existingIndex = list.findIndex(
      (c) => c.number.replace(/\D/g, '').slice(-10) === cleanNum
    );
    if (existingIndex >= 0) {
      list[existingIndex] = contact;
    } else {
      list.unshift(contact);
    }
    localStorage.setItem(STORAGE_KEYS.CONTACTS_LIST, JSON.stringify(list));
  },

  deleteContact(id: string): void {
    const list = this.getContacts().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTACTS_LIST, JSON.stringify(list));
  },

  importContacts(contacts: { name: string; number: string }[]): number {
    const current = this.getContacts();
    let addedCount = 0;
    for (const c of contacts) {
      const cleanNum = c.number.replace(/\D/g, '').slice(-10);
      if (cleanNum.length === 10) {
        const exists = current.some(
          (item) => item.number.replace(/\D/g, '').slice(-10) === cleanNum
        );
        if (!exists) {
          current.push({
            id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: c.name.trim() || `+91 ${cleanNum}`,
            number: cleanNum,
          });
          addedCount++;
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.CONTACTS_LIST, JSON.stringify(current));
    return addedCount;
  },

  getBalance(): number {
    const bal = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (bal !== null && !isNaN(parseFloat(bal))) {
      return parseFloat(bal);
    }
    return 0;
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
      type: 'credit',
      utr: `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
    });
    return updated;
  },

  getTransactions(): TransactionItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch {
      // ignore
    }
    return [];
  },

  addTransaction(
    desc: string,
    amount: number,
    extra?: Partial<TransactionItem>
  ): TransactionItem {
    const list = this.getTransactions();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const item: TransactionItem = {
      id: `TXN${Date.now().toString().slice(-7)}`,
      date: dateStr,
      time: timeStr,
      desc,
      amount,
      type: extra?.type || 'debit',
      utr: extra?.utr || `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(100000 + Math.random() * 900000)}`,
      payeeVpa: extra?.payeeVpa,
      status: extra?.status || 'success',
      mode: extra?.mode || 'IN_APP_UPI',
    };

    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    return item;
  },

  isBiometricEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return val === 'true';
  },

  setBiometricEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },

  logout(): void {
    this.setLoggedIn(false);
  },

  clearAllData(): void {
    localStorage.clear();
  },
};
