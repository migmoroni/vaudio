import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VGameEngine, TerminalOutput, TerminalCommand } from '../../../../shared/src/engine';

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
    const handleGameOutput = (data: TerminalOutput) => {
      addOutput(data);
    };

    const handleEngineStarted = () => {
      setIsEngineRunning(true);
      addOutput({
        type: 'text',
        content: 'Game engine iniciada. Use os comandos para interagir.',
        timestamp: Date.now()
      });
    };

    const handleEngineStopped = () => {
      setIsEngineRunning(false);
      addOutput({
        type: 'text',
        content: 'Game engine parada.',
        timestamp: Date.now()
      });
    };

    const handleSceneChanged = (data: any) => {
      const scene = data.scene;
      addOutput({
        type: 'text',
        content: `=== ${scene.title} ===\n${scene.description}`,
        timestamp: Date.now()
      });
      
      if (scene.choices && scene.choices.length > 0) {
        const choicesText = scene.choices
          .map((choice: any, index: number) => `${index + 1}. ${choice.text}`)
          .join('\n');
        
        addOutput({
          type: 'choice',
          content: `Opções:\n${choicesText}`,
          timestamp: Date.now()
        });
      }
    };

    gameEngine.on('game:output', handleGameOutput);
    gameEngine.on('engine:started', handleEngineStarted);
    gameEngine.on('engine:stopped', handleEngineStopped);
    gameEngine.on('scene:changed', handleSceneChanged);

    return () => {
      gameEngine.off('game:output', handleGameOutput);
      gameEngine.off('engine:started', handleEngineStarted);
      gameEngine.off('engine:stopped', handleEngineStopped);
      gameEngine.off('scene:changed', handleSceneChanged);
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
          await gameEngine.executeCommand('help');
          break;
          
        case 'status':
          await gameEngine.executeCommand('status');
          break;
          
        case 'start':
          await gameEngine.start();
          break;
          
        case 'stop':
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
          setOutput([]);
          break;
          
        case 'history':
          const historyText = commandHistory
            .map((cmd, i) => `${i + 1}. ${cmd.command}`)
            .join('\n');
          addOutput({
            type: 'text',
            content: `Histórico de comandos:\n${historyText}`,
            timestamp: Date.now()
          });
          break;
          
        default:
          // Tenta executar como comando do jogo
          try {
            await gameEngine.executeCommand(cmd);
          } catch {
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
