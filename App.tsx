import React, { useRef } from 'react';
import FireworkCanvas from './components/FireworkCanvas';
import Controls from './components/Controls';

// Interface matching the exposed handle from FireworkCanvas
interface FireworkRef {
  launch: (text: string) => void;
}

const App: React.FC = () => {
  const fireworkRef = useRef<FireworkRef>(null);

  const handleLaunch = (text: string) => {
    fireworkRef.current?.launch(text);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-purple-500/30">
      
      {/* Background/Main Canvas */}
      <FireworkCanvas ref={fireworkRef} />

      {/* Overlay UI */}
      <div className="absolute top-8 left-8 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          WHISPERING FIREWORKS
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
          Interactive Particle Physics
        </p>
      </div>

      <div className="absolute top-8 right-8 z-10 text-right opacity-50 hidden sm:block">
        <p className="text-xs text-gray-500 font-mono">
          CTX.GLOBAL_COMPOSITE = 'LIGHTER'<br/>
          PHYSICS: VERLET INTEGRATION<br/>
          RENDER: HTML5 CANVAS
        </p>
      </div>

      {/* Control Footer */}
      <Controls onLaunch={handleLaunch} isReady={true} />
      
    </main>
  );
};

export default App;