import { useState, useEffect } from 'react';
import { VGameEngine } from '../../../shared/src/engine';
import TerminalConsole from './components/TerminalConsole';
import { createSampleGame } from './game/sampleGame';

function App() {
  const [gameEngine, setGameEngine] = useState<VGameEngine | null>(null);
  const [mode, setMode] = useState<'menu' | 'terminal' | 'visual'>('menu');

  useEffect(() => {
    // Inicializa a game engine com o jogo de exemplo
    const engine = createSampleGame();
    setGameEngine(engine);
  }, []);

  const handleStartTerminalMode = () => {
    setMode('terminal');
  };

  const handleStartVisualMode = () => {
    setMode('visual');
    // TODO: Implementar modo visual
  };

  const handleBackToMenu = () => {
    setMode('menu');
    if (gameEngine) {
      gameEngine.stop();
    }
  };

  if (!gameEngine) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando VAudio...</div>
      </div>
    );
  }

  if (mode === 'terminal') {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="p-4 bg-gray-800 border-b border-gray-600">
          <button
            onClick={handleBackToMenu}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            ← Voltar ao Menu
          </button>
        </div>
        <div className="flex-1">
          <TerminalConsole gameEngine={gameEngine} />
        </div>
      </div>
    );
  }

  if (mode === 'visual') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Modo Visual</h1>
          <p className="text-lg text-gray-600 mb-8">
            Modo visual ainda não implementado
          </p>
          <button
            onClick={handleBackToMenu}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  // Menu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8 bg-black/30 rounded-lg backdrop-blur-sm">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          VAudio
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Game Engine & Platform para Jogos de Texto/Áudio
        </p>

        <div className="space-y-4">
          <button
            onClick={handleStartTerminalMode}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>🖥️</span>
            <span>Modo Terminal Console</span>
          </button>

          <button
            onClick={handleStartVisualMode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>🎮</span>
            <span>Modo Visual/Tátil</span>
          </button>

          <div className="mt-8 text-sm text-gray-400">
            <p>Controles do Terminal:</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>W/1/↑ - Botão 1</div>
              <div>E/2/→ - Botão 2</div>
              <div>S/3/↓ - Botão 3</div>
              <div>D/4/← - Botão 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
