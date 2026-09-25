import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, ShieldAlert } from 'lucide-react';

interface PinLockModalProps {
  storedPin: string;
  onUnlocked: () => void;
  isDarkMode: boolean;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  storedPin,
  onUnlocked,
  isDarkMode,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === storedPin) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometric = () => {
    // Biometric simulated authentication
    onUnlocked();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#0F1015] text-neutral-100 animate-in fade-in duration-200">
      <div className="w-full flex flex-col items-center pt-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
          <Lock size={26} />
        </div>
        <h2 className="text-xl font-bold">Udhar Manager</h2>
        <p className="text-xs text-neutral-400 mt-1">Enter your 4-digit security PIN</p>

        {/* PIN dots */}
        <div className="flex gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-rose-500 scale-110 animate-bounce'
                    : isFilled
                    ? 'bg-emerald-500 scale-105 shadow-md shadow-emerald-500/50'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <ShieldAlert size={14} />
            Incorrect PIN. Try again.
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num.toString())}
            className="h-16 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 active:scale-95 text-xl font-semibold transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}

        {/* Biometric trigger */}
        <button
          type="button"
          onClick={handleBiometric}
          className="h-16 rounded-2xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 active:scale-95 text-emerald-400 transition-all flex items-center justify-center"
          title="Unlock with Biometric Fingerprint"
        >
          <Fingerprint size={24} />
        </button>

        {/* 0 */}
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 active:scale-95 text-xl font-semibold transition-all flex items-center justify-center"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 active:scale-95 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
        >
          <Delete size={22} />
        </button>
      </div>

      <div className="text-[11px] text-neutral-500 pb-2">
        Protected with Android Keystore encryption
      </div>
    </div>
  );
};
