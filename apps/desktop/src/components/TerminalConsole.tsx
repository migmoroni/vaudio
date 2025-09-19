import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VGameEngine, TerminalOutput, TerminalCommand } from '../../../../shared/src';

interface TerminalConsoleProps {
  gameEngine: VGameEngine;
  className?: string;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({ 
  gameEngine, 
  className = '' 
}) => {
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isEngineRunning, setIsEngineRunning] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Adiciona output inicial quando o componente é montado
  useEffect(() => {
    addOutput({
      type: 'text',
      content: 'VAudio Game Engine - Terminal Console\nDigite "help" para ver comandos disponíveis ou "start" para iniciar a engine.',
      timestamp: Date.now()
    });
  }, []);

  // Scroll automático para o final quando há novo output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Escuta eventos da game engine
  useEffect(() => {
    const handleEngineEvent = (event: any) => {
      switch (event.type) {
        case 'output':
          addOutput(event.data);
          break;
          
        case 'engine_started':
          setIsEngineRunning(true);
          addOutput({
            type: 'text',
            content: 'Game engine iniciada. Use comandos [1], [2], [3], [4] ou suas combinações.',
            timestamp: Date.now()
          });
          break;
          
        case 'engine_stopped':
          setIsEngineRunning(false);
          addOutput({
            type: 'text',
            content: 'Game engine parada.',
            timestamp: Date.now()
          });
          break;
          
        case 'scene_changed':
          // A engine já emite o output da cena automaticamente
          break;
          
        case 'error':
          addOutput({
            type: 'text',
            content: `Erro: ${event.data.message}`,
            timestamp: Date.now()
          });
          break;
      }
    };

    // Registra listeners para todos os tipos de eventos
    gameEngine.on('output', handleEngineEvent);
    gameEngine.on('engine_started', handleEngineEvent);
    gameEngine.on('engine_stopped', handleEngineEvent);
    gameEngine.on('scene_changed', handleEngineEvent);
    gameEngine.on('error', handleEngineEvent);

    return () => {
      gameEngine.off('output', handleEngineEvent);
      gameEngine.off('engine_started', handleEngineEvent);
      gameEngine.off('engine_stopped', handleEngineEvent);
      gameEngine.off('scene_changed', handleEngineEvent);
      gameEngine.off('error', handleEngineEvent);
    };
  }, [gameEngine]);

  const addOutput = useCallback((newOutput: TerminalOutput) => {
    setOutput(prev => [...prev, newOutput]);
  }, []);

  const processCommand = useCallback(async (commandText: string) => {
    const trimmedCommand = commandText.trim();
    if (!trimmedCommand) return;

    // Adiciona comando ao histórico
    const command: TerminalCommand = {
      command: trimmedCommand,
      args: trimmedCommand.split(' ').slice(1),
      timestamp: Date.now()
    };

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Mostra o comando digitado no output
    addOutput({
      type: 'text',
      content: `> ${trimmedCommand}`,
      timestamp: Date.now()
    });

    // Processa comandos do sistema
    const [cmd] = trimmedCommand.split(' ');
    
    try {
      switch (cmd.toLowerCase()) {
        case 'help':
        case 'ajuda':
          await gameEngine.executeCommand([1, 2, 3, 4]); // Combinação especial para ajuda do sistema
          break;
          
        case 'status':
          await gameEngine.executeCommand([2, 3, 4]); // Combinação para status
          break;
          
        case 'start':
        case 'iniciar':
          await gameEngine.start();
          break;
          
        case 'stop':
        case 'parar':
          await gameEngine.stop();
          break;
          
        case 'debug':
          const debugInfo = gameEngine.getDebugInfo();
          addOutput({
            type: 'text',
            content: `Debug Info:\n${JSON.stringify(debugInfo, null, 2)}`,
            timestamp: Date.now()
          });
          break;
          
        case 'clear':
        case 'limpar':
          setOutput([]);
          break;
          
        case 'history':
        case 'historico':
          const historyText = commandHistory
            .map((cmd, i) => `${i + 1}. ${cmd.command}`)
            .join('\n');
          addOutput({
            type: 'text',
            content: `Histórico de comandos:\n${historyText}`,
            timestamp: Date.now()
          });
          break;

        // Comandos universais diretos
        case '1':
          await gameEngine.executeCommand([1]);
          break;
        case '2':
          await gameEngine.executeCommand([2]);
          break;
        case '3':
          await gameEngine.executeCommand([3]);
          break;
        case '4':
          await gameEngine.executeCommand([4]);
          break;

        // Comandos por nome (para compatibilidade)
        case 'explorar':
          await gameEngine.executeCommand([1]);
          break;
        case 'inventario':
          await gameEngine.executeCommand([2]);
          break;
        case 'sair':
          await gameEngine.executeCommand([4]);
          break;
          
        default:
          // Tenta processar como combinação de números
          const numbers = cmd.split('').map(c => parseInt(c)).filter(n => !isNaN(n) && n >= 1 && n <= 4);
          if (numbers.length > 0) {
            await gameEngine.executeCommand(numbers as any);
          } else {
            addOutput({
              type: 'text',
              content: `Comando não reconhecido: ${cmd}. Digite "help" para ver comandos disponíveis.`,
              timestamp: Date.now()
            });
          }
          break;
      }
    } catch (error) {
      addOutput({
        type: 'text',
        content: `Erro ao executar comando: ${error}`,
        timestamp: Date.now()
      });
    }
  }, [gameEngine, commandHistory, addOutput]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex].command);
        }
      }
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getOutputStyle = (type: string): string => {
    switch (type) {
      case 'choice':
        return 'text-blue-300';
      case 'prompt':
        return 'text-yellow-300';
      case 'audio':
        return 'text-purple-300';
      default:
        return 'text-gray-100';
    }
  };

  return (
    <div className={`bg-black text-green-400 font-mono text-sm flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-600">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Terminal Console</h3>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs ${
              isEngineRunning ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isEngineRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* Output */}
      <div 
        ref={outputRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {output.map((item, index) => (
          <div key={index} className="mb-2">
            <div className={`whitespace-pre-wrap ${getOutputStyle(item.type)}`}>
              {item.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              [{formatTimestamp(item.timestamp)}]
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-600">
        <form onSubmit={handleInputSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none"
            placeholder="Digite um comando..."
            autoFocus
          />
        </form>
        <div className="text-xs text-gray-500 mt-2">
          Use ↑/↓ para navegar no histórico | Tab para autocompletar
        </div>
      </div>
    </div>
  );
};

export default TerminalConsole;
