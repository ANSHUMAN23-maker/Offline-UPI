# Offline UPI (React Web Application)

A modern, responsive React and TypeScript web rewrite of the Offline UPI application originally created for Android. This application allows users to perform offline UPI transactions, initiate bank and contact transfers, generate and scan UPI QR codes, and simulate NPCI (*99#) USSD operations without requiring an active data connection.

---

## Features Ported from Original Android Project

* **Get Started & Language Selection**: Multi-language support (English, Hindi, Tamil, Malayalam, Kannada, Telugu).
* **User Registration & Profile**: Store User Name, Phone Number, and UPI ID with client-side encrypted storage.
* **Offline NUUP Setup & Activation**: Interactive guide and simulator for NPCI \*99# bank account linking.
* **PIN Setup & Authentication**: Encrypted 4-digit security PIN setup, confirmation, and authentication screen.
* **Security Questions PIN Reset**: 3 configurable security questions to recover and reset forgotten PINs.
* **Main Dashboard**:
  * Send money to Phone Number / Contacts
  * Send money to UPI ID / VPA
  * Send money to Bank Account (IFSC + Account Number)
  * QR Code Scan & Pay (with camera scanner and file upload QR decoder)
  * Check Bank Balance (initiates \*99\*3# USSD string)
  * Transaction History (initiates \*99\*6\*1# USSD string)
  * Quick Dial \*99# launcher
* **Contact Book**: Searchable contact list with quick payment initiation.
* **QR Code Generator**: Generates verifiable UPI payment QR codes (`upi://pay?pa=...`) with custom amount and note.
* **QR Code Scanner**: Live video camera scanner powered by `jsqr` with fallback image drag-and-drop decoder.
* **USSD Dialog Simulation**: Global USSD dialog mimicking GSM cellular session prompt screens with interactive menu response handling.

---

## Tech Stack

* **Framework**: React 18 with TypeScript & Vite
* **Styling**: Tailwind CSS
* **Icons**: `lucide-react`
* **QR Generation**: `qrcode`
* **QR Code Scanning**: `jsqr` with HTML5 `<video>` / `<canvas>`
* **State & Persistence**: Typed localStorage wrapper with encryption helper

---

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
