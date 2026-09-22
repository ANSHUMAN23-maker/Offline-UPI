import React, { useState } from 'react';
import { ContactItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { storage } from '../utils/storage';
import { ArrowLeft, Search, User, Phone, Plus, X } from 'lucide-react';

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
  const [contacts, setContacts] = useState<ContactItem[]>(storage.getContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');

  const filtered = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.number.includes(q);
  });

  const handleSelect = (number: string) => {
    storage.setSelectedContact(number);
    onSelectContact(number);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newNumber.trim()) {
      const cleanNum = newNumber.replace(/\D/g, '');
      const item: ContactItem = {
        id: String(Date.now()),
        name: newName.trim(),
        number: cleanNum,
      };
      storage.addContact(item);
      setContacts([item, ...contacts]);
      setShowAddModal(false);
      setNewName('');
      setNewNumber('');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col p-4 max-w-md mx-auto select-none">
      {/* Header with Search */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-2 text-slate-600 hover:text-black rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="p-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          title="Add Contact"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto mt-3 divide-y divide-slate-100">
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelect(c.number)}
              className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{c.number}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                Select
              </span>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No contacts found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Add New Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contact Name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-black text-white rounded-lg shadow hover:bg-slate-900"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
