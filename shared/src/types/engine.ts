// Comandos universais simples que a engine reconhece
export type UniversalCommand = 1 | 2 | 3 | 4;

// Combinações de comandos (arrays de comandos universais)
export type CommandCombination = UniversalCommand[];

// Entrada que a engine recebe do processador de input
export interface EngineInput {
  command: CommandCombination;
  timestamp: number;
}

// Estado básico do jogo
export interface GameState {
  currentScene: string;
  variables: Record<string, any>;
  history: string[];
  player: {
    name?: string;
    stats?: Record<string, any>;
  };
}

// Estrutura de uma cena do jogo
export interface GameScene {
  id: string;
  title: string;
  description: string;
  audio?: string;
  choices?: GameChoice[];
  onEnter?: (context: GameContext) => void | Promise<void>;
  onExit?: (context: GameContext) => void | Promise<void>;
}

// Opção/escolha dentro de uma cena
export interface GameChoice {
  id: string;
  text: string;
  audio?: string;
  commands: CommandCombination[]; // Quais comandos ativam esta escolha
  condition?: (context: GameContext) => boolean;
  action: (context: GameContext) => void | Promise<void>;
  nextScene?: string;
}

// Ação que pode ser executada por comandos
export interface GameAction {
  id: string;
  name: string;
  description: string;
  commands: CommandCombination[]; // Comandos que ativam esta ação
  condition?: (context: GameContext) => boolean;
  action: (context: GameContext) => void | Promise<void>;
}

// Contexto completo do jogo
export interface GameContext {
  state: GameState;
  scenes: Map<string, GameScene>;
  actions: Map<string, GameAction>;
  engine: GameEngine;
}

// Interface da game engine
export interface GameEngine {
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  processInput(input: EngineInput): void | Promise<void>;
  executeCommand(command: CommandCombination): void | Promise<void>;
  changeScene(sceneId: string): void | Promise<void>;
  updateState(updates: Partial<GameState>): void;
  getContext(): GameContext;
}

// Output da engine para interfaces
export interface GameOutput {
  type: 'text' | 'audio' | 'choice' | 'prompt' | 'scene_change';
  content: string;
  timestamp: number;
  metadata?: any;
}

// Event system
export type GameEvent = 
  | { type: 'engine_started' }
  | { type: 'engine_stopped' }
  | { type: 'scene_changed'; data: { previousScene: string; currentScene: string; scene: GameScene } }
  | { type: 'state_updated'; data: { updates: Partial<GameState>; newState: GameState } }
  | { type: 'output'; data: GameOutput }
  | { type: 'command_executed'; data: { command: CommandCombination; action?: GameAction } }
  | { type: 'error'; data: { message: string; error?: any } };

// Tipos para Terminal Interface
export interface TerminalOutput {
  type: 'text' | 'audio' | 'choice' | 'prompt' | 'scene_change';
  content: string;
  timestamp: number;
  metadata?: any;
}

export interface TerminalCommand {
  command: string;
  args: string[];
  timestamp: number;
}
