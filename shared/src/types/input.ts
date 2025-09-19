// Tipos para dispositivos de entrada
export enum InputDevice {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
  VOICE = 'voice',
}

// Mapeamento de entradas físicas para comandos universais
export interface InputMapping {
  device: InputDevice;
  trigger: string | number; // tecla, botão, gesture, etc.
  command: import('./engine').UniversalCommand;
}

// Evento de entrada bruto do dispositivo
export interface RawInputEvent {
  device: InputDevice;
  data: any; // dados específicos do dispositivo
  timestamp: number;
}

// Configuração do processador de input
export interface InputProcessorConfig {
  mappings: InputMapping[];
  combinationTimeout: number; // tempo limite para combinações em ms
  enableCombinations: boolean;
}
