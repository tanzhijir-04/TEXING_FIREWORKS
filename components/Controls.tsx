import React, { useState } from 'react';

interface ControlsProps {
  onLaunch: (text: string) => void;
  isReady: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onLaunch, isReady }) => {
  const [text, setText] = useState('2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onLaunch(text.trim());
    }
  };

  return (
    <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-center items-center px-4 pointer-events-none">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl pointer-events-auto transition-all hover:bg-black/60 hover:border-white/20"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-transparent text-white font-bold text-lg px-4 py-2 w-32 sm:w-48 outline-none placeholder-white/30 text-center tracking-wider uppercase"
          placeholder="ENTER TEXT"
          maxLength={8}
        />
        <button
          type="submit"
          disabled={!isReady}
          className="bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold py-2 px-6 rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
        >
          Ignite
        </button>
      </form>
    </div>
  );
};

export default Controls;