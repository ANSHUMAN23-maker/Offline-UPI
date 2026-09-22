export type LanguageCode = 'en' | 'hi' | 'ta' | 'ml' | 'kn' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  ussdCode: string;
}

export interface UserData {
  myName: string;
  myPhone: string;
  myUPIid: string;
}

export interface ContactItem {
  id: string;
  name: string;
  number: string;
}

export interface SecurityQuestionsData {
  [question: string]: string;
}

export interface TransactionItem {
  id: string;
  date: string;
  time?: string;
  desc: string;
  amount: number;
  type: 'debit' | 'credit';
  utr?: string;
  payeeVpa?: string;
  status?: 'success' | 'failed' | 'pending';
  mode?: 'UPI_INTENT' | 'IN_APP_UPI' | 'USSD_NUUP';
}

export interface PaymentExecutionData {
  payeeName: string;
  payeeVpa: string;
  amount: number;
  note?: string;
  referenceId?: string;
}

export type ScreenType =
  | 'get_started'
  | 'register'
  | 'offline_register'
  | 'set_pin'
  | 'security_questions'
  | 'enter_pin'
  | 'use_security_question'
  | 'main'
  | 'to_phone'
  | 'to_upi'
  | 'to_bank'
  | 'contacts'
  | 'menu'
  | 'qr_generate'
  | 'scan_qr'
  | 'upi_guide'
  | 'transaction_history';

export interface USSDSessionState {
  isOpen: boolean;
  dialCode: string;
  title: string;
  response: string;
  options?: { key: string; label: string }[];
  status?: 'dialing' | 'connected' | 'completed' | 'error';
  onAction?: (actionKey: string) => void;
}
