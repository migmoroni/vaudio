// Command types representing the 8 possible input combinations
export type CommandType = '1' | '2' | '3' | '4' | '1+2' | '1+4' | '3+2' | '3+4';

// Program structure types (for menus and system programs)
export interface ProgramChoice {
  label: string;
  goto?: string; // "@/path" for programs, "games/path" for games, "-" for back, "*" for exit
  choice?: Record<CommandType, ProgramChoice>; // Sub-menu choices
}

export interface Program {
  id: string;
  description: string;
  choice: Record<CommandType, ProgramChoice>;
  extra?: string; // Reference to extra frame number (e.g., "1", "2", "3", "4")
}

// Game structure types
export interface GameConfig {
  id: string;
  title: string;
  version: string;
  author: string[];
  license: string;
  description: string;
  tag: string[];
  entry: string;
  extra?: Record<string, string>; // Extra frames mapping (e.g., "1": "extra/inventory.json")
  module?: {
    scene: { path: string };
    npc: { path: string };
    item: { path: string };
    rule: { path: string };
    narrative: { path: string };
    action?: { path: string };
  };
  config: {
    language: string[];
    command_map?: Record<CommandType, string>;
  };
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  choices?: {
    [key in CommandType]?: Array<{
      text: string;
      goto: string;
    }>;
  };
  audio?: string;
  background?: string;
}

export interface GameState {
  currentScene: string;
  inventory: string[];
  variables: Record<string, any>;
  history: string[];
}

// Application state
export interface AppState {
  mode: 'program' | 'game';
  currentProgram?: Program;
  currentGame?: GameConfig;
  gameState?: GameState;
  programStack: string[]; // For navigation history
  
  // New selection system
  selectedOption?: CommandType; // Currently selected option (1-4)
  currentList: 'main' | 'extra'; // Which list is active (removed list1/list2)
  awaitingConfirmation: boolean; // Whether user needs to press 3+4 to confirm
  extraFrameNumber?: string; // Current extra frame being displayed (1-4)
}

// Input system types
export interface InputEvent {
  type: 'keypress';
  key: string;
  timestamp: number;
}

export interface Command {
  type: CommandType;
  timestamp: number;
  raw: string;
}

// Engine types
export interface EngineOptions {
  basePath: string;
  renderer: Renderer;
  inputHandler: InputHandler;
}

export interface Renderer {
  renderProgram(program: Program, state: AppState): Promise<void>;
  renderGame(scene: Scene, state: GameState): Promise<void>;
  clear(): void;
  showMessage(message: string): Promise<void>;
  showSelection(option: CommandType, text: string): Promise<void>; // Show selected option awaiting confirmation
}

export interface InputHandler {
  initialize(): Promise<void>;
  getCommand(): Promise<Command>;
  cleanup(): void;
}
