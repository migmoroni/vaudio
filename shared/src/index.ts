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

export { InputProcessor } from './input';
export type { 
  InputDevice, 
  InputMapping, 
  InputProcessorConfig, 
  RawInputEvent 
} from './types/input';
