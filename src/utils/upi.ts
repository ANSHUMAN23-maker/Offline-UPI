/**
 * NPCI Unified Payments Interface (UPI) Protocol Implementation
 * Supports NPCI UPI Deep Linking Specification, VPA resolution,
 * BharatQR parsing, and intent launching across mobile devices.
 */

export interface UpiPaymentDetails {
  pa: string; // Payee VPA (Virtual Payment Address) e.g., merchant@bank
  pn?: string; // Payee Name e.g., Rohan Verma
  am?: number | string; // Transaction Amount
  cu?: string; // Currency code (default: INR)
  tn?: string; // Transaction Note / Remarks
  tr?: string; // Transaction Reference ID
  mc?: string; // Merchant Category Code
  url?: string; // Reference URL
  mode?: string; // Mode of payment
}

export interface ParsedUpiData {
  isValidUpi: boolean;
  vpa: string;
  payeeName: string;
  amount: number | null;
  note: string;
  rawUri: string;
  referenceId?: string;
  merchantCode?: string;
}

/**
 * Validates a UPI ID / Virtual Payment Address (e.g. name@okhdfcbank, 9876543210@paytm)
 */
export function isValidUpiId(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') return false;
  const trimmed = vpa.trim().toLowerCase();
  // Standard VPA pattern: username@bankhandle (handle must be at least 2 chars)
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(trimmed);
}

/**
 * Builds a standardized NPCI UPI Intent URI
 * Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 */
export function buildUpiUri(details: UpiPaymentDetails): string {
  const params = new URLSearchParams();
  params.set('pa', details.pa.trim());

  if (details.pn) {
    params.set('pn', details.pn.trim());
  }

  if (details.am !== undefined && details.am !== null && details.am !== '') {
    const num = typeof details.am === 'string' ? parseFloat(details.am) : details.am;
    if (!isNaN(num) && num > 0) {
      params.set('am', num.toFixed(2));
    }
  }

  params.set('cu', details.cu || 'INR');

  if (details.tn) {
    params.set('tn', details.tn.trim());
  }

  if (details.tr) {
    params.set('tr', details.tr.trim());
  }

  if (details.mc) {
    params.set('mc', details.mc.trim());
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Parses raw text or QR code content into structured UPI payment details.
 * Supports standard upi://pay URIs, BharatQR formats, or direct VPA addresses.
 */
export function parseUpiPayload(raw: string): ParsedUpiData {
  const trimmed = (raw || '').trim();

  // 1. Direct upi://pay URI
  if (trimmed.toLowerCase().startsWith('upi://pay')) {
    try {
      const url = new URL(trimmed.replace(/^upi:\/\/pay/i, 'https://dummy.upi'));
      const pa = url.searchParams.get('pa') || '';
      const pn = url.searchParams.get('pn') || '';
      const am = url.searchParams.get('am');
      const tn = url.searchParams.get('tn') || '';
      const tr = url.searchParams.get('tr') || '';
      const mc = url.searchParams.get('mc') || '';

      const parsedAmount = am ? parseFloat(am) : null;

      return {
        isValidUpi: Boolean(pa),
        vpa: pa,
        payeeName: pn || pa.split('@')[0] || 'UPI Recipient',
        amount: parsedAmount && !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : null,
        note: tn,
        rawUri: trimmed,
        referenceId: tr,
        merchantCode: mc,
      };
    } catch {
      // Fallback query regex parser if URL parsing fails
      const paMatch = trimmed.match(/[?&]pa=([^&]+)/i);
      const pnMatch = trimmed.match(/[?&]pn=([^&]+)/i);
      const amMatch = trimmed.match(/[?&]am=([^&]+)/i);
      const tnMatch = trimmed.match(/[?&]tn=([^&]+)/i);

      const pa = paMatch ? decodeURIComponent(paMatch[1]) : '';
      const pn = pnMatch ? decodeURIComponent(pnMatch[1]) : '';
      const am = amMatch ? parseFloat(decodeURIComponent(amMatch[1])) : null;
      const tn = tnMatch ? decodeURIComponent(tnMatch[1]) : '';

      return {
        isValidUpi: Boolean(pa),
        vpa: pa,
        payeeName: pn || pa.split('@')[0] || 'UPI Recipient',
        amount: am && !isNaN(am) ? am : null,
        note: tn,
        rawUri: trimmed,
      };
    }
  }

  // 2. Direct VPA entered or scanned (e.g. "merchant@icici" or "9876543210@paytm")
  if (isValidUpiId(trimmed)) {
    return {
      isValidUpi: true,
      vpa: trimmed,
      payeeName: trimmed.split('@')[0] || 'Beneficiary',
      amount: null,
      note: 'Transfer',
      rawUri: buildUpiUri({ pa: trimmed, pn: trimmed.split('@')[0] }),
    };
  }

  // 3. 10-digit Phone number (common UPI phone format e.g. 9876543210)
  const phoneClean = trimmed.replace(/\D/g, '');
  if (phoneClean.length === 10) {
    const vpa = `${phoneClean}@upi`;
    return {
      isValidUpi: true,
      vpa,
      payeeName: `Contact ${phoneClean}`,
      amount: null,
      note: 'Mobile Transfer',
      rawUri: buildUpiUri({ pa: vpa, pn: phoneClean }),
    };
  }

  // Unrecognized
  return {
    isValidUpi: false,
    vpa: trimmed,
    payeeName: trimmed,
    amount: null,
    note: '',
    rawUri: trimmed,
  };
}

/**
 * Checks if current browser environment is a mobile device (Android, iOS)
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Launches the UPI Intent URI on the client device.
 * On Android/iOS, this triggers the OS UPI App Chooser (Google Pay, PhonePe, Paytm, BHIM, Cred).
 * Returns true if launch initiated, false if unsupported.
 */
export function launchUpiIntent(upiUri: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Standard deep link navigation
    window.location.href = upiUri;
    return true;
  } catch (err) {
    console.warn('Failed to invoke UPI Intent:', err);
    return false;
  }
}

/**
 * Generates an authentic 12-digit Indian Bank UTR (Unique Transaction Reference)
 * e.g., 2209 1845 9210
 */
export function generateUTR(): string {
  const timestamp = Date.now().toString().slice(-8); // 8 digits
  const random4 = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
  return `${timestamp}${random4}`;
}

/**
 * Formats a numeric value into INR currency string (₹ X,XXX.XX)
 */
export function formatINR(val: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `₹${val.toFixed(2)}`;
  }
}
