export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
}

export interface AppConfig {
  version: string;
  platform: 'web' | 'mobile' | 'desktop';
  features: string[];
}

export type Platform = 'web' | 'mobile' | 'desktop';

export enum AppStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

// Sistema de Input da Game Engine
export enum ButtonType {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
}

export enum InputDevice {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
  VOICE = 'voice',
}

export interface ButtonState {
  button: ButtonType;
  pressed: boolean;
  timestamp: number;
}

export interface InputCombination {
  buttons: ButtonType[];
  duration?: number; // tempo mínimo para considerar a combinação válida
  maxInterval?: number; // intervalo máximo entre pressionamentos
}

export interface InputEvent {
  device: InputDevice;
  buttonStates: ButtonState[];
  combination?: InputCombination;
  timestamp: number;
  raw?: any; // dados brutos do evento original
}

export interface Command {
  id: string;
  name: string;
  description: string;
  combinations: InputCombination[];
  action: (context: GameContext) => void | Promise<void>;
}

// Game Engine Core
export interface GameState {
  currentScene: string;
  variables: Record<string, any>;
  history: string[];
  player: {
    name?: string;
    stats?: Record<string, any>;
  };
}

export interface GameScene {
  id: string;
  title: string;
  description: string;
  audio?: string;
  choices?: GameChoice[];
  onEnter?: (context: GameContext) => void | Promise<void>;
  onExit?: (context: GameContext) => void | Promise<void>;
}

export interface GameChoice {
  id: string;
  text: string;
  audio?: string;
  condition?: (context: GameContext) => boolean;
  action: (context: GameContext) => void | Promise<void>;
  nextScene?: string;
}

export interface GameContext {
  state: GameState;
  scenes: Map<string, GameScene>;
  commands: Map<string, Command>;
  engine: GameEngine;
}

export interface GameEngine {
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  processInput(event: InputEvent): void | Promise<void>;
  executeCommand(commandId: string): void | Promise<void>;
  changeScene(sceneId: string): void | Promise<void>;
  updateState(updates: Partial<GameState>): void;
  getContext(): GameContext;
}

// Tipos para Interface do Terminal
export interface TerminalOutput {
  type: 'text' | 'audio' | 'choice' | 'prompt';
  content: string;
  timestamp: number;
  metadata?: any;
}

export interface TerminalCommand {
  command: string;
  args: string[];
  timestamp: number;
}
