import { storage } from './storage';
import { triggerPaymentSuccessHaptic } from './haptics';

export interface UssdResponse {
  dialCode: string;
  title: string;
  body: string;
  options?: { key: string; label: string }[];
  isSuccess?: boolean;
}

export function buildUssdToMobile(phone: string, amount: string): string {
  // Pattern: *99*1*1*<phoneNumber>*<amount>*1#
  return `*99*1*1*${phone}*${amount}*1#`;
}

export function buildUssdToUpi(): string {
  // Pattern: *99*1*3#
  return `*99*1*3#`;
}

export function buildUssdToBank(ifsc: string, account: string, amount: string): string {
  // Pattern: *99*1*5*<IFSC>*<Account>*<Amount>*1#
  return `*99*1*5*${ifsc}*${account}*${amount}*1#`;
}

export function buildUssdCheckBalance(): string {
  return `*99*3#`;
}

export function buildUssdRecentTransactions(): string {
  return `*99*6*1#`;
}

export function buildUssdChangeBankAccount(): string {
  return `*99*4*1#`;
}

export function buildUssdChangeLanguage(langCodeNumber: string): string {
  return `*99*4*2*${langCodeNumber}`;
}

export function executeUssdCall(dialCode: string): void {
  try {
    window.location.href = `tel:${encodeURIComponent(dialCode)}`;
  } catch {
    // ignore
  }
}

export function simulateUssdResponse(dialCode: string, payload?: { phone?: string; amount?: number; upiId?: string; account?: string }): UssdResponse {
  const currentBalance = storage.getBalance();

  if (dialCode.includes('*99*3#')) {
    return {
      dialCode: '*99*3#',
      title: 'NPCI NUUP - Balance Enquiry',
      body: `State Bank of India\nA/c No: XX4821\nAvailable Balance: ₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\nThank you for using *99# NUUP Offline Banking.`,
      isSuccess: true,
    };
  }

  if (dialCode.includes('*99*6*1#')) {
    const txns = storage.getTransactions();
    const listText = txns.slice(0, 4).map((t, i) => `${i + 1}. ${t.date}: ₹${t.amount} (${t.desc})`).join('\n');
    return {
      dialCode: '*99*6*1#',
      title: 'NPCI NUUP - Mini Statement',
      body: `Recent Transactions for A/c XX4821:\n\n${listText || 'No recent transactions'}\n\nPress 0 for Main Menu`,
      options: [{ key: '0', label: 'Main Menu' }],
      isSuccess: true,
    };
  }

  if (dialCode.startsWith('*99*1*1*')) {
    const amt = payload?.amount || 0;
    const phone = payload?.phone || '';
    const newBal = storage.deductBalance(amt);
    storage.addTransaction(`Transfer to ${phone}`, amt);
    triggerPaymentSuccessHaptic();
    const ref = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    return {
      dialCode,
      title: 'Payment Successful',
      body: `Transfer to ${phone} of ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been processed successfully!\n\nRef: ${ref}\nA/c Debited: XX4821\nRemaining Balance: ₹${newBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nOffline SMS receipt sent.`,
      isSuccess: true,
    };
  }

  if (dialCode.startsWith('*99*1*5*')) {
    const amt = payload?.amount || 0;
    const acc = payload?.account || 'Account';
    const newBal = storage.deductBalance(amt);
    storage.addTransaction(`Bank transfer to ${acc}`, amt);
    triggerPaymentSuccessHaptic();
    const ref = `IMPS${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    return {
      dialCode,
      title: 'Bank Transfer Successful',
      body: `Transfer of ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to A/c ${acc} via *99# NUUP was successful.\n\nRef No: ${ref}\nRemaining Balance: ₹${newBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      isSuccess: true,
    };
  }

  if (dialCode === '*99*1*3#') {
    return {
      dialCode: '*99*1*3#',
      title: 'NPCI NUUP - Pay to UPI ID',
      body: `Dialing *99*1*3# for UPI ID payment.\n\nYour UPI ID has been copied to your clipboard. Paste it when prompted by the cellular USSD session.`,
      isSuccess: true,
    };
  }

  if (dialCode === '*99#') {
    return {
      dialCode: '*99#',
      title: 'Welcome to *99# NUUP Service',
      body: `1. Send Money\n2. Request Money\n3. Check Balance\n4. My Profile\n5. Pending Request\n6. Transactions\n7. UPI PIN\n\nYour bank account is linked to your SIM card.`,
      options: [
        { key: '1', label: 'Send Money' },
        { key: '3', label: 'Check Balance' },
        { key: '4', label: 'My Profile' },
        { key: '6', label: 'Transactions' },
      ],
      isSuccess: true,
    };
  }

  if (dialCode.includes('*99*4*1#')) {
    return {
      dialCode: '*99*4*1#',
      title: 'Change Bank Account',
      body: `NPCI *99# Service\nSelect Primary Bank Account:\n1. State Bank of India (XX4821) [Active]\n2. HDFC Bank (XX9012)\n3. Link New Account`,
      isSuccess: true,
    };
  }

  if (dialCode.includes('*99*4*2*')) {
    return {
      dialCode,
      title: 'Language Updated',
      body: `Preferred language for *99# NUUP offline service updated successfully. Your offline prompts will now appear in your selected language.`,
      isSuccess: true,
    };
  }

  return {
    dialCode,
    title: 'NPCI *99# Session',
    body: `Dialing ${dialCode} over GSM network...\nSession completed.`,
    isSuccess: true,
  };
}
