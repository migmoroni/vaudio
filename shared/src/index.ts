export * from './constants';
export * from './utils';

// Re-export específicos para evitar conflitos
export { VGameEngine } from './engine/VGameEngine';
export type { 
  GameEngine, 
  GameContext, 
  GameState, 
  GameScene, 
  GameChoice,
  GameAction,
  EngineInput,
  CommandCombination,
  UniversalCommand,
  GameEvent,
  GameOutput,
  TerminalOutput,
  TerminalCommand
} from './types/engine';

export { 
  InputProcessor,
  CommandProcessor,
  type GameCommand,
  type CommandEvent,
  type CommandCallback
} from './input';
export type { 
  InputDevice, 
  InputMapping, 
  InputProcessorConfig
} from './types/input';
