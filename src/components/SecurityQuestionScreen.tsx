import React, { useState } from 'react';
import { LanguageCode, SecurityQuestionsData } from '../types';
import { TRANSLATIONS, SECURITY_QUESTIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { HelpCircle, CheckCircle } from 'lucide-react';

interface SecurityQuestionScreenProps {
  currentLang: LanguageCode;
  onSuccess: () => void;
}

export const SecurityQuestionScreen: React.FC<SecurityQuestionScreenProps> = ({
  currentLang,
  onSuccess,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [q1, setQ1] = useState(SECURITY_QUESTIONS[0]);
  const [a1, setA1] = useState('');

  const [q2, setQ2] = useState(SECURITY_QUESTIONS[1]);
  const [a2, setA2] = useState('');

  const [q3, setQ3] = useState(SECURITY_QUESTIONS[2]);
  const [a3, setA3] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedA1 = a1.trim();
    const trimmedA2 = a2.trim();
    const trimmedA3 = a3.trim();

    if (!trimmedA1 || !trimmedA2 || !trimmedA3) {
      setError(t.answer_all_questions);
      return;
    }

    const data: SecurityQuestionsData = {
      [q1]: trimmedA1.toLowerCase(),
      [q2]: trimmedA2.toLowerCase(),
      [q3]: trimmedA3.toLowerCase(),
    };

    storage.setSecurityQuestions(data);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      <div className="pt-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-100">
            <HelpCircle className="w-7 h-7 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {t.security_questions}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.security_questions_subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Question 1
            </label>
            <select
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              placeholder="Answer 1"
              className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Question 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Question 2
            </label>
            <select
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={a2}
              onChange={(e) => setA2(e.target.value)}
              placeholder="Answer 2"
              className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Question 3 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Question 3
            </label>
            <select
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={a3}
              onChange={(e) => setA3(e.target.value)}
              placeholder="Answer 3"
              className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              className="w-48 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center py-3 text-xs text-slate-400">
        Used for recovering your Offline UPI PIN without internet
      </div>
    </div>
  );
};
