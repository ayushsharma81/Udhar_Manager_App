import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2, Terminal, Code2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  onOpenSourceInspector: () => void;
  isDarkMode: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onOpenSourceInspector,
  isDarkMode,
}) => {
  const [time, setTime] = useState('9:41');
  const [isFramed, setIsFramed] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-0 md:p-4 select-none">
      {/* Top Floating Control Bar */}
      <header className="hidden md:flex items-center justify-between w-full max-w-[430px] mb-3 px-3 py-1.5 bg-neutral-900/90 border border-neutral-800 backdrop-blur rounded-2xl text-xs text-neutral-300 shadow-xl z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-400">Android 15 (API 35)</span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-400">Jetpack Compose M3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSourceInspector}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/80 transition-all font-medium text-[11px]"
            title="Inspect & download native Kotlin/Gradle source files"
          >
            <Code2 size={13} />
            <span>APK Source</span>
          </button>
          <button
            onClick={() => setIsFramed(!isFramed)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title={isFramed ? 'Switch to Full Screen' : 'Switch to Phone Frame'}
          >
            {isFramed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Android Device Shell */}
      <div
        className={`relative transition-all duration-300 overflow-hidden flex flex-col ${
          isFramed
            ? 'w-full md:w-[412px] h-[100dvh] md:h-[870px] md:max-h-[92vh] md:rounded-[46px] md:border-[10px] md:border-neutral-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-black'
            : 'w-full max-w-lg h-[100dvh]'
        } ${isDarkMode ? 'bg-[#121316] text-neutral-100' : 'bg-[#F9FAFB] text-neutral-900'}`}
      >
        {/* Status Bar */}
        <div
          className={`h-11 px-6 flex items-center justify-between z-30 shrink-0 text-xs font-semibold tracking-tight transition-colors ${
            isDarkMode ? 'bg-[#121316] text-neutral-200' : 'bg-white text-neutral-800'
          }`}
        >
          {/* Time & App Notification indicator */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm tracking-tight">{time}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80" />
          </div>

          {/* Android Camera Punch Hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-700/60 shadow-inner" />

          {/* System Icons: 5G, Wifi, Battery */}
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Signal size={13} className="text-current" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi size={13} className="text-current ml-0.5" />
            <div className="flex items-center gap-0.5 ml-1">
              <span className="text-[10px] font-medium text-emerald-400">89%</span>
              <BatteryMedium size={14} className="text-current" />
            </div>
          </div>
        </div>

        {/* Device Screen Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* Android Gesture Navigation Bar (Pill) */}
        <div
          className={`h-5 w-full flex items-center justify-center shrink-0 z-30 ${
            isDarkMode ? 'bg-[#121316]' : 'bg-[#F9FAFB]'
          }`}
        >
          <div className="w-32 h-1 rounded-full bg-neutral-400/40 hover:bg-neutral-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};
