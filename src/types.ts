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
  | 'scan_qr';

export interface USSDSessionState {
  isOpen: boolean;
  dialCode: string;
  title: string;
  response: string;
  options?: { key: string; label: string }[];
  status?: 'dialing' | 'connected' | 'completed' | 'error';
  onAction?: (actionKey: string) => void;
}
