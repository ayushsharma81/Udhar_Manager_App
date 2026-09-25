import React, { useState } from 'react';
import { Search, UserPlus, Phone, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Person, Transaction } from '../types';
import { calculatePersonBalance, formatRupee } from '../utils/calculator';

interface PeopleViewProps {
  people: Person[];
  transactions: Transaction[];
  onOpenAddPerson: () => void;
  onSelectPerson: (person: Person) => void;
  isDarkMode: boolean;
}

type FilterType = 'all' | 'they_owe_me' | 'i_owe_them' | 'overdue' | 'settled';

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  transactions,
  onOpenAddPerson,
  onSelectPerson,
  isDarkMode,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const now = Date.now();

  const filteredPeople = people.filter((p) => {
    // Search match
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const summary = calculatePersonBalance(p.id, transactions, p.isSettled);
    const personTxs = transactions.filter((t) => t.personId === p.id);
    const isOverdue = personTxs.some((t) => t.dueDate != null && t.dueDate < now);

    switch (filter) {
      case 'they_owe_me':
        return !p.isSettled && summary.outstandingOwedToUser > 0;
      case 'i_owe_them':
        return !p.isSettled && summary.liabilityOwedByUser > 0;
      case 'overdue':
        return !p.isSettled && isOverdue && summary.outstandingOwedToUser > 0;
      case 'settled':
        return p.isSettled;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">People & Contacts</h2>
          <p className="text-xs text-neutral-400">Manage individual ledgers & balances</p>
        </div>
        <button
          onClick={onOpenAddPerson}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <UserPlus size={14} />
          <span>Add Person</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Search by name, phone or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs border transition-colors ${
            isDarkMode
              ? 'bg-[#181A20] border-neutral-800 text-neutral-100 placeholder:text-neutral-500'
              : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
          }`}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Contacts' },
          { id: 'they_owe_me', label: 'They Owe Me' },
          { id: 'i_owe_them', label: 'I Owe Them' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'settled', label: 'Settled' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as FilterType)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
              filter === f.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : isDarkMode
                ? 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* People List */}
      <div className="space-y-2 pt-1">
        {filteredPeople.map((person) => {
          const summary = calculatePersonBalance(person.id, transactions, person.isSettled);
          const isTheyOweMe = summary.outstandingOwedToUser > 0;
          const isIOweThem = summary.liabilityOwedByUser > 0;

          return (
            <div
              key={person.id}
              onClick={() => onSelectPerson(person)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] ${
                isDarkMode
                  ? 'bg-[#181A20] border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                    person.isSettled
                      ? 'bg-neutral-800 text-neutral-400'
                      : isTheyOweMe
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : isIOweThem
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  }`}
                >
                  {person.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate text-neutral-100">
                      {person.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      {person.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone size={11} />
                      {person.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Outstanding Balance & Arrow */}
              <div className="flex items-center gap-2.5 text-right shrink-0">
                <div>
                  {person.isSettled ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-neutral-400">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>Settled</span>
                    </div>
                  ) : isTheyOweMe ? (
                    <div>
                      <div className="text-xs font-extrabold font-mono text-emerald-400">
                        {formatRupee(summary.outstandingOwedToUser)}
                      </div>
                      <div className="text-[10px] text-emerald-500/90 font-medium">Owes you</div>
                    </div>
                  ) : isIOweThem ? (
                    <div>
                      <div className="text-xs font-extrabold font-mono text-rose-400">
                        {formatRupee(summary.liabilityOwedByUser)}
                      </div>
                      <div className="text-[10px] text-rose-400/90 font-medium">You owe</div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-neutral-400">₹0 Balance</div>
                  )}
                </div>

                <ChevronRight
                  size={16}
                  className="text-neutral-500 group-hover:text-neutral-300 transition-colors"
                />
              </div>
            </div>
          );
        })}

        {filteredPeople.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-neutral-800/80 bg-neutral-900/30">
            <p className="text-xs text-neutral-400 font-medium">No contacts found matching filter.</p>
            <button
              onClick={onOpenAddPerson}
              className="mt-3 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
            >
              Add First Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
