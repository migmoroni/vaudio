import { 
  InputDevice, 
  InputMapping
} from '../types/input';
import { IInputDevice } from './BaseInputDevice';
import { KeyboardInputDevice } from './KeyboardInputDevice';
import { MouseInputDevice } from './MouseInputDevice';
import { GamepadInputDevice } from './GamepadInputDevice';
import { TouchInputDevice } from './TouchInputDevice';
import { VoiceInputDevice } from './VoiceInputDevice';
import { CommandProcessor, CommandCallback } from './CommandProcessor';
import { GameCommand, CommandEvent } from './CommandTypes';

/**
 * Configuração do InputProcessor atualizada
 */
export interface InputProcessorConfig {
  mappings?: InputMapping[];
  combinationTimeout?: number;
  enableCombinations?: boolean;
  debugMode?: boolean;
}

/**
 * Processador principal de entrada que coordena todos os dispositivos
 * e converte entradas em comandos de jogo (strings)
 */
export class InputProcessor {
  private config: InputProcessorConfig;
  private commandProcessor: CommandProcessor;
  
  // Dispositivos especializados
  private devices: Map<InputDevice, IInputDevice> = new Map();
  
  // Callbacks para comandos processados
  private commandCallbacks: CommandCallback[] = [];

  constructor(config?: InputProcessorConfig) {
    this.config = {
      mappings: [],
      combinationTimeout: 500, // 500ms para combinações
      enableCombinations: true,
      debugMode: false,
      ...config
    };

    // Inicializa processador de comandos
    this.commandProcessor = new CommandProcessor({
      combinationTimeout: this.config.combinationTimeout,
      enableCombinations: this.config.enableCombinations,
      debugMode: this.config.debugMode
    });

    // Inicializa dispositivos especializados
    this.initializeDevices();
    
    // Conecta processador de comandos aos callbacks
    this.commandProcessor.onCommand((commandEvent) => {
      this.notifyCommandCallbacks(commandEvent);
    });
  }

  /**
   * Registra callback para receber comandos processados
   */
  onCommand(callback: CommandCallback): void {
    this.commandCallbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCommandCallback(callback: CommandCallback): void {
    const index = this.commandCallbacks.indexOf(callback);
    if (index > -1) {
      this.commandCallbacks.splice(index, 1);
    }
  }

  /**
   * Inicializa dispositivos especializados
   */
  private initializeDevices(): void {
    // Filtra mapeamentos por dispositivo
    const keyboardMappings = this.config.mappings?.filter(m => m.device === InputDevice.KEYBOARD);
    const mouseMappings = this.config.mappings?.filter(m => m.device === InputDevice.MOUSE);
    const gamepadMappings = this.config.mappings?.filter(m => m.device === InputDevice.GAMEPAD);
    const touchMappings = this.config.mappings?.filter(m => m.device === InputDevice.TOUCH);
    const voiceMappings = this.config.mappings?.filter(m => m.device === InputDevice.VOICE);

    // Cria dispositivos com mapeamentos personalizados se fornecidos
    this.devices.set(InputDevice.KEYBOARD, new KeyboardInputDevice(keyboardMappings?.length ? keyboardMappings : undefined));
    this.devices.set(InputDevice.MOUSE, new MouseInputDevice(mouseMappings?.length ? mouseMappings : undefined));
    this.devices.set(InputDevice.GAMEPAD, new GamepadInputDevice(gamepadMappings?.length ? gamepadMappings : undefined));
    this.devices.set(InputDevice.TOUCH, new TouchInputDevice(touchMappings?.length ? touchMappings : undefined));
    this.devices.set(InputDevice.VOICE, new VoiceInputDevice(voiceMappings?.length ? voiceMappings : undefined));
  }

  /**
   * Processa entrada de teclado
   */
  processKeyboardInput(key: string, modifiers?: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }): void {
    const keyboardDevice = this.devices.get(InputDevice.KEYBOARD);
    if (!keyboardDevice) return;

    const inputData = {
      key: key.toLowerCase(),
      ...modifiers
    };

    const commands = keyboardDevice.processInput(inputData);
    if (commands && commands.length > 0) {
      // Processa primeiro comando válido
      this.commandProcessor.processInput(commands[0], 'keyboard', inputData);
    }
  }

  /**
   * Processa entrada de mouse
   */
  processMouseInput(data: {
    button?: number;
    x?: number;
    y?: number;
    deltaX?: number;
    deltaY?: number;
    wheelDelta?: number;
  }): void {
    const mouseDevice = this.devices.get(InputDevice.MOUSE);
    if (!mouseDevice) return;

    const commands = mouseDevice.processInput(data);
    if (commands && commands.length > 0) {
      // Processa primeiro comando válido
      this.commandProcessor.processInput(commands[0], 'mouse', data);
    }
  }

  /**
   * Processa entrada de gamepad
   */
  processGamepadInput(data: {
    button?: number;
    axis?: number;
    axisValue?: number;
    pressed?: boolean;
  }): void {
    const gamepadDevice = this.devices.get(InputDevice.GAMEPAD);
    if (!gamepadDevice) return;

    const commands = gamepadDevice.processInput(data);
    if (commands && commands.length > 0) {
      // Processa primeiro comando válido
      this.commandProcessor.processInput(commands[0], 'gamepad', data);
    }
  }

  /**
   * Processa entrada touch
   */
  processTouchInput(data: {
    x: number;
    y: number;
    type?: string;
    force?: number;
  }): void {
    const touchDevice = this.devices.get(InputDevice.TOUCH);
    if (!touchDevice) return;

    const commands = touchDevice.processInput(data);
    if (commands && commands.length > 0) {
      // Processa primeiro comando válido
      this.commandProcessor.processInput(commands[0], 'touch', data);
    }
  }

  /**
   * Processa entrada de voz
   */
  processVoiceInput(data: {
    command: string;
    confidence?: number;
  }): void {
    const voiceDevice = this.devices.get(InputDevice.VOICE);
    if (!voiceDevice) return;

    const commands = voiceDevice.processInput(data);
    if (commands && commands.length > 0) {
      // Processa primeiro comando válido
      this.commandProcessor.processInput(commands[0], 'voice', data);
    }
  }

  /**
   * Força emissão de comando específico
   */
  forceCommand(command: GameCommand): void {
    this.commandProcessor.forceCommand(command, 'manual');
  }

  /**
   * Cancela combinação em andamento
   */
  cancelCombination(): void {
    this.commandProcessor.cancelCombination();
  }

  /**
   * Notifica todos os callbacks sobre comando processado
   */
  private notifyCommandCallbacks(commandEvent: CommandEvent): void {
    this.commandCallbacks.forEach(callback => {
      try {
        callback(commandEvent);
      } catch (error) {
        console.error('[InputProcessor] Erro ao executar callback:', error);
      }
    });
  }

  /**
   * Obtém dispositivo específico
   */
  getDevice(deviceType: InputDevice): IInputDevice | undefined {
    return this.devices.get(deviceType);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    const deviceInfo: any = {};
    this.devices.forEach((device, type) => {
      const deviceName = type.toString();
      deviceInfo[deviceName] = device.getDebugInfo();
    });

    return {
      config: this.config,
      commandProcessor: this.commandProcessor.getDebugInfo(),
      devices: deviceInfo,
      callbackCount: this.commandCallbacks.length
    };
  }

  /**
   * Cleanup - remove todos os listeners e timers
   */
  destroy(): void {
    this.commandProcessor.destroy();
    this.commandCallbacks.length = 0;
    this.devices.clear();
  }
}
