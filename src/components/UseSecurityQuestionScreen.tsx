import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface UseSecurityQuestionScreenProps {
  currentLang: LanguageCode;
  onSuccess: () => void;
  onBack: () => void;
}

export const UseSecurityQuestionScreen: React.FC<UseSecurityQuestionScreenProps> = ({
  currentLang,
  onSuccess,
  onBack,
}) => {
  const t = TRANSLATIONS[currentLang];
  const savedQuestionsMap = storage.getSecurityQuestions();

  const questionsList = savedQuestionsMap ? Object.keys(savedQuestionsMap) : [];

  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!savedQuestionsMap || questionsList.length < 3) {
      // If no questions saved yet, allow resetting
      onSuccess();
      return;
    }

    const q1 = questionsList[0];
    const q2 = questionsList[1];
    const q3 = questionsList[2];

    const expected1 = (savedQuestionsMap[q1] || '').trim().toLowerCase();
    const expected2 = (savedQuestionsMap[q2] || '').trim().toLowerCase();
    const expected3 = (savedQuestionsMap[q3] || '').trim().toLowerCase();

    const input1 = a1.trim().toLowerCase();
    const input2 = a2.trim().toLowerCase();
    const input3 = a3.trim().toLowerCase();

    if (input1 === expected1 && input2 === expected2 && input3 === expected3) {
      onSuccess();
    } else {
      setError('One or more answers are invalid!');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div className="pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-black py-2 px-1 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="text-center mt-6 mb-8">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <KeyRound className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {t.reset_pin}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Answer the security questions configured on this device
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {questionsList.length >= 3 ? (
            <>
              {/* Question 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  {questionsList[0]}
                </label>
                <input
                  type="text"
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  placeholder="Your answer"
                  className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Question 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  {questionsList[1]}
                </label>
                <input
                  type="text"
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  placeholder="Your answer"
                  className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Question 3 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  {questionsList[2]}
                </label>
                <input
                  type="text"
                  value={a3}
                  onChange={(e) => setA3(e.target.value)}
                  placeholder="Your answer"
                  className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
              No previous security questions found. You can proceed directly to setting a new PIN.
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              className="w-48 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-3 text-xs text-slate-400 font-mono">
        Answers are verified offline on device
      </div>
    </div>
  );
};
