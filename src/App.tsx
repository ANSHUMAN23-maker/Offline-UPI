import React, { useState } from 'react';
import { LanguageCode, ScreenType, USSDSessionState } from './types';
import { storage } from './utils/storage';
import { simulateUssdResponse } from './utils/ussd';

// Screens
import { GetStartedScreen } from './components/GetStartedScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { OfflineRegisterScreen } from './components/OfflineRegisterScreen';
import { SetPinScreen } from './components/SetPinScreen';
import { SecurityQuestionScreen } from './components/SecurityQuestionScreen';
import { UseSecurityQuestionScreen } from './components/UseSecurityQuestionScreen';
import { EnterPinScreen } from './components/EnterPinScreen';
import { MainScreen } from './components/MainScreen';
import { ToPhoneScreen } from './components/ToPhoneScreen';
import { ToUpiScreen } from './components/ToUpiScreen';
import { ToBankAccountScreen } from './components/ToBankAccountScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { MenuScreen } from './components/MenuScreen';
import { QRGenerateScreen } from './components/QRGenerateScreen';
import { ScanQRScreen } from './components/ScanQRScreen';
import { TransactionHistoryScreen } from './components/TransactionHistoryScreen';
import { UssdModal } from './components/UssdModal';

export const App: React.FC = () => {
  // Determine initial screen based on registration & login state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const isRegistered = storage.isRegistered();
    const hasPin = Boolean(storage.getStoredPin());
    const isLoggedIn = storage.isLoggedIn();

    if (isRegistered && hasPin) {
      return isLoggedIn ? 'main' : 'enter_pin';
    }
    return 'get_started';
  });

  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    return storage.getLanguage();
  });

  // USSD modal session state
  const [ussdSession, setUssdSession] = useState<USSDSessionState>({
    isOpen: false,
    dialCode: '',
    title: '',
    response: '',
  });

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    storage.setLanguage(lang);
  };

  const openUssdModal = (
    dialCode: string,
    title: string,
    response: string,
    options?: { key: string; label: string }[]
  ) => {
    setUssdSession({
      isOpen: true,
      dialCode,
      title,
      response,
      options,
    });
  };

  const closeUssdModal = () => {
    setUssdSession((prev: USSDSessionState) => ({ ...prev, isOpen: false }));
  };

  const handleUssdSubmitInput = (input: string) => {
    // Process numeric selection or command in USSD session
    const trimmed = input.trim();
    if (trimmed === '1') {
      const resp = simulateUssdResponse('*99*6*1#');
      setUssdSession({
        isOpen: true,
        dialCode: resp.dialCode,
        title: resp.title,
        response: resp.body,
        options: resp.options,
      });
    } else if (trimmed === '2') {
      const resp = simulateUssdResponse('*99*3#');
      setUssdSession({
        isOpen: true,
        dialCode: resp.dialCode,
        title: resp.title,
        response: resp.body,
        options: resp.options,
      });
    } else {
      closeUssdModal();
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'get_started':
        return (
          <GetStartedScreen
            currentLang={currentLang}
            onSelectLanguage={handleSelectLanguage}
            onGetStarted={() => {
              if (storage.isRegistered()) {
                if (storage.getStoredPin()) {
                  setCurrentScreen('enter_pin');
                } else {
                  setCurrentScreen('set_pin');
                }
              } else {
                setCurrentScreen('register');
              }
            }}
            onActivateOffline={() => setCurrentScreen('offline_register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            currentLang={currentLang}
            isEditing={storage.isRegistered()}
            onSuccess={() => setCurrentScreen('set_pin')}
            onBack={() => {
              if (storage.isRegistered()) {
                setCurrentScreen('menu');
              } else {
                setCurrentScreen('get_started');
              }
            }}
          />
        );

      case 'offline_register':
        return (
          <OfflineRegisterScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('get_started')}
            onContinue={() => setCurrentScreen('register')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'set_pin':
        return (
          <SetPinScreen
            currentLang={currentLang}
            onSuccess={() => setCurrentScreen('security_questions')}
          />
        );

      case 'security_questions':
        return (
          <SecurityQuestionScreen
            currentLang={currentLang}
            onSuccess={() => {
              storage.setLoggedIn(true);
              setCurrentScreen('main');
            }}
          />
        );

      case 'use_security_question':
        return (
          <UseSecurityQuestionScreen
            currentLang={currentLang}
            onSuccess={() => setCurrentScreen('set_pin')}
            onBack={() => {
              if (storage.isLoggedIn()) {
                setCurrentScreen('menu');
              } else {
                setCurrentScreen('enter_pin');
              }
            }}
          />
        );

      case 'enter_pin':
        return (
          <EnterPinScreen
            currentLang={currentLang}
            onSuccess={() => setCurrentScreen('main')}
            onForgotPin={() => setCurrentScreen('use_security_question')}
          />
        );

      case 'main':
        return (
          <MainScreen
            currentLang={currentLang}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'to_phone':
        return (
          <ToPhoneScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
            onOpenContacts={() => setCurrentScreen('contacts')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'to_upi':
        return (
          <ToUpiScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'to_bank':
        return (
          <ToBankAccountScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'contacts':
        return (
          <ContactsScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
            onSelectContact={(_num) => setCurrentScreen('to_phone')}
          />
        );

      case 'menu':
        return (
          <MenuScreen
            currentLang={currentLang}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectLanguage={handleSelectLanguage}
            onLogout={() => setCurrentScreen('get_started')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'qr_generate':
        return (
          <QRGenerateScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('menu')}
          />
        );

      case 'scan_qr':
        return (
          <ScanQRScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
            onOpenUssdModal={openUssdModal}
          />
        );

      case 'transaction_history':
        return (
          <TransactionHistoryScreen
            currentLang={currentLang}
            onBack={() => setCurrentScreen('main')}
          />
        );

      default:
        return (
          <GetStartedScreen
            currentLang={currentLang}
            onSelectLanguage={handleSelectLanguage}
            onGetStarted={() => setCurrentScreen('register')}
            onActivateOffline={() => setCurrentScreen('offline_register')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-start sm:p-4 select-none">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[844px] sm:my-auto sm:rounded-[40px] shadow-2xl overflow-hidden relative border border-slate-800">
        {/* Mobile Status Bar Simulation */}
        <div className="h-6 bg-transparent px-6 pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-800 z-20 pointer-events-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>📶 Cellular (NUUP *99#)</span>
            <span>🔋 100%</span>
          </div>
        </div>

        {/* Active Screen View */}
        <div className="w-full">{renderScreen()}</div>

        {/* Global USSD Simulation Dialog Modal */}
        <UssdModal
          session={ussdSession}
          onClose={closeUssdModal}
          onSelectOption={handleUssdSubmitInput}
        />
      </div>
    </div>
  );
};

export default App;
