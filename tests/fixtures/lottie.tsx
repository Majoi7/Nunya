import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LottieIcon } from '../../src/components/LottieIcon';
import { ANIMATIONS } from '../../src/assets/animations/registry';
import type { AnimationName } from '../../src/types/animations';
import '../../src/index.css';

function Fixture() {
  const [key, setKey] = useState(0);
  const [play, setPlay] = useState(true);
  const [mounted, setMounted] = useState(true);
  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Vérification locale des animations</h1>
      <div className="flex flex-wrap gap-3 mb-5">
        <button type="button" id="replay" onClick={() => setKey(value => value + 1)} className="min-h-11 px-4 border rounded-full">Relancer</button>
        <button type="button" id="pause" onClick={() => setPlay(value => !value)} className="min-h-11 px-4 border rounded-full">Pause / Lecture</button>
        <button type="button" id="mount" onClick={() => setMounted(value => !value)} className="min-h-11 px-4 border rounded-full">Monter / Démonter</button>
      </div>
      {mounted && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(ANIMATIONS) as AnimationName[]).map(animation => (
          <button key={animation} type="button" id={`test-${animation}`} className="min-h-28 border border-[#E5E7EB] rounded-2xl p-3 flex flex-col items-center gap-3">
            <LottieIcon animation={animation} size={48} tone={animation === 'xp' || animation === 'star' ? 'xp' : animation === 'streak' ? 'warning' : animation === 'error' ? 'error' : 'ink'} trigger="manual" replayKey={key} play={play} loop={animation === 'loading'} />
            <span className="text-xs font-semibold">{animation}</span>
          </button>
        ))}
      </div>}
      <button id="offscreen" type="button" className="mt-[1200px] min-h-11 flex items-center gap-3">
        <LottieIcon animation="loading" size={32} trigger="mount" loop />
        <span>Chargement hors écran</span>
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
