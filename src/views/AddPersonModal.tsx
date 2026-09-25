import React, { useState } from 'react';
import { X, UserPlus, Phone, User, Tag, Globe, FileText, AlertCircle } from 'lucide-react';
import { Language, PersonCategory } from '../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePerson: (person: {
    name: string;
    phone: string;
    category: PersonCategory;
    notes: string;
    defaultLanguage: Language;
  }) => void;
  isDarkMode: boolean;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onSavePerson,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<PersonCategory>('FRIEND');
  const [defaultLanguage, setDefaultLanguage] = useState<Language>('ENGLISH');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone Number is required for SMS reminders');
      return;
    }

    onSavePerson({
      name: name.trim(),
      phone: phone.trim(),
      category,
      notes: notes.trim(),
      defaultLanguage,
    });

    onClose();
  };

  const categories: { label: string; value: PersonCategory }[] = [
    { label: 'Friend', value: 'FRIEND' },
    { label: 'Relative', value: 'RELATIVE' },
    { label: 'Customer', value: 'CUSTOMER' },
    { label: 'Merchant', value: 'MERCHANT' },
    { label: 'Other', value: 'OTHER' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-[#181A20] border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Add New Person</h3>
              <p className="text-xs text-neutral-400">Create contact for lending & borrowing ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-neutral-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border transition-colors ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                }`}
                autoFocus
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border transition-colors ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                }`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    category === c.value
                      ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-sm'
                      : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Language for SMS Reminders */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Default SMS Reminder Language
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['ENGLISH', 'HINDI', 'HINGLISH'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setDefaultLanguage(lang)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    defaultLanguage === lang
                      ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                      : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Neighbor, Shop customer, Collateral notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs border transition-colors resize-none ${
                isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
              }`}
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/40 active:scale-[0.99] transition-all"
          >
            Save Person
          </button>
        </form>
      </div>
    </div>
  );
};
