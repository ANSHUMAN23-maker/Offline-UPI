import React, { useState } from 'react';
import { ContactItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { ArrowLeft, Search, User, Phone, Plus, X, Trash2, Smartphone, Users, UserPlus } from 'lucide-react';
import { triggerKeypadHaptic } from '../utils/haptics';

interface ContactsScreenProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onSelectContact: (contactNumber: string) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  currentLang,
  onBack,
  onSelectContact,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [contacts, setContacts] = useState<ContactItem[]>(() => storage.getContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.number.includes(q);
  });

  const handleSelect = (number: string) => {
    triggerKeypadHaptic();
    storage.setSelectedContact(number);
    onSelectContact(number);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    triggerKeypadHaptic();
    storage.deleteContact(id);
    setContacts(storage.getContacts());
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    triggerKeypadHaptic();

    const cleanName = newName.trim();
    const cleanNum = newNumber.replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setError('Please enter contact name.');
      return;
    }
    if (cleanNum.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    const item: ContactItem = {
      id: `c_${Date.now()}`,
      name: cleanName,
      number: cleanNum,
    };

    storage.addContact(item);
    setContacts(storage.getContacts());
    setShowAddModal(false);
    setNewName('');
    setNewNumber('');
    setStatusMsg(`Contact "${cleanName}" added!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImportPhoneContacts = async () => {
    triggerKeypadHaptic();
    setError(null);
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const picked = await (navigator as any).contacts.select(props, opts);
        if (picked && picked.length > 0) {
          const formatted = picked.map((p: any) => ({
            name: (p.name && p.name[0]) || 'Contact',
            number: (p.tel && p.tel[0]) || '',
          }));
          const added = storage.importContacts(formatted);
          setContacts(storage.getContacts());
          setStatusMsg(`Successfully imported ${added} contact${added === 1 ? '' : 's'} from your phone!`);
          setTimeout(() => setStatusMsg(null), 4000);
          return;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Could not access phone contacts: ' + (err.message || 'Permission denied'));
        }
      }
    } else {
      // Browser doesn't support Web Contacts Picker API (common in desktop or non-Android browsers)
      setShowAddModal(true);
      setError('Direct phone contacts picker is supported on Android mobile browsers. You can add contacts manually here.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col p-4 max-w-md mx-auto select-none">
      {/* Header with Search */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <button
          onClick={() => {
            triggerKeypadHaptic();
            onBack();
          }}
          className="p-2 text-slate-600 hover:text-black rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search || 'Search name or number...'}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            triggerKeypadHaptic();
            setError(null);
            setShowAddModal(true);
          }}
          className="p-2.5 bg-slate-950 hover:bg-black text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          title="Add Contact"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {statusMsg && (
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Contacts List or Empty State */}
      <div className="flex-1 overflow-y-auto mt-3">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c.number)}
                className="py-3 px-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block truncate max-w-[180px]">
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      +91 {c.number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    Pay
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {searchQuery ? 'No matching contacts found' : 'No Contacts Saved Yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with a different name or mobile number.'
                  : 'Add frequent payees or import contacts directly from your phone.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={handleImportPhoneContacts}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Import from Phone Contacts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerKeypadHaptic();
                  setShowAddModal(true);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contact Manually</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Add New Payee</span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAddContact} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-black"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    value={newNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      if (clean.length <= 10) setNewNumber(clean);
                    }}
                    placeholder="10-digit number"
                    className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono focus:outline-none focus:border-black"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
