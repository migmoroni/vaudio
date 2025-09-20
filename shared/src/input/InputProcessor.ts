import { 
  InputDevice, 
  InputMapping, 
  InputProcessorConfig, 
  RawInputEvent 
} from '../types/input';
import { 
  UniversalCommand, 
  EngineInput 
} from '../types/engine';
import { IInputDevice } from './BaseInputDevice';
import { KeyboardInputDevice } from './KeyboardInputDevice';
import { MouseInputDevice } from './MouseInputDevice';
import { GamepadInputDevice } from './GamepadInputDevice';
import { TouchInputDevice } from './TouchInputDevice';
import { VoiceInputDevice } from './VoiceInputDevice';

export class InputProcessor {
  private config: InputProcessorConfig;
  private pendingCommands: UniversalCommand[] = [];
  private combinationTimer: NodeJS.Timeout | null = null;
  private lastInputTime: number = 0;
  
  // Dispositivos especializados
  private devices: Map<InputDevice, IInputDevice> = new Map();

  constructor(config?: Partial<InputProcessorConfig>) {
    this.config = {
      mappings: [],
      combinationTimeout: 500, // 500ms para combinações
      enableCombinations: true,
      ...config
    };

    // Inicializa dispositivos especializados
    this.initializeDevices();
  }

  /**
   * Inicializa dispositivos especializados
   */
  private initializeDevices(): void {
    // Cria dispositivos com mapeamentos personalizados se fornecidos
    const keyboardMappings = this.config.mappings.filter(m => m.device === InputDevice.KEYBOARD);
    const mouseMappings = this.config.mappings.filter(m => m.device === InputDevice.MOUSE);
    const gamepadMappings = this.config.mappings.filter(m => m.device === InputDevice.GAMEPAD);
    const touchMappings = this.config.mappings.filter(m => m.device === InputDevice.TOUCH);
    const voiceMappings = this.config.mappings.filter(m => m.device === InputDevice.VOICE);

    this.devices.set(InputDevice.KEYBOARD, new KeyboardInputDevice(keyboardMappings.length > 0 ? keyboardMappings : undefined));
    this.devices.set(InputDevice.MOUSE, new MouseInputDevice(mouseMappings.length > 0 ? mouseMappings : undefined));
    this.devices.set(InputDevice.GAMEPAD, new GamepadInputDevice(gamepadMappings.length > 0 ? gamepadMappings : undefined));
    this.devices.set(InputDevice.TOUCH, new TouchInputDevice(touchMappings.length > 0 ? touchMappings : undefined));
    this.devices.set(InputDevice.VOICE, new VoiceInputDevice(voiceMappings.length > 0 ? voiceMappings : undefined));
  }

  /**
   * Processa uma entrada bruta e retorna comandos universais
   */
  processRawInput(rawInput: RawInputEvent): EngineInput[] {
    const commands = this.mapRawInputToCommands(rawInput);
    const results: EngineInput[] = [];

    for (const command of commands) {
      if (this.config.enableCombinations) {
        // Adiciona à combinação pendente
        this.pendingCommands.push(command);
        this.lastInputTime = rawInput.timestamp;

        // Cancela timer anterior
        if (this.combinationTimer) {
          clearTimeout(this.combinationTimer);
        }

        // Define timer para executar combinação
        this.combinationTimer = setTimeout(() => {
          if (this.pendingCommands.length > 0) {
            results.push({
              command: [...this.pendingCommands],
              timestamp: this.lastInputTime
            });
            this.pendingCommands = [];
          }
        }, this.config.combinationTimeout);

      } else {
        // Modo sem combinações - executa comando individual imediatamente
        results.push({
          command: [command],
          timestamp: rawInput.timestamp
        });
      }
    }

    return results;
  }

  /**
   * Processa entrada de teclado diretamente
   */
  processKeyboardInput(key: string): EngineInput[] {
    const keyboardDevice = this.devices.get(InputDevice.KEYBOARD);
    if (!keyboardDevice) return [];

    const commands = keyboardDevice.processInput({ key: key.toLowerCase() });
    return this.wrapCommandsInEngineInput(commands);
  }

  /**
   * Processa entrada de mouse diretamente
   */
  processMouseInput(button?: number, x?: number, y?: number, wheel?: number): EngineInput[] {
    const mouseDevice = this.devices.get(InputDevice.MOUSE);
    if (!mouseDevice) return [];

    const data: any = {};
    if (button !== undefined) data.button = button;
    if (x !== undefined && y !== undefined) {
      data.x = x;
      data.y = y;
    }
    if (wheel !== undefined) data.wheel = wheel;

    const commands = mouseDevice.processInput(data);
    return this.wrapCommandsInEngineInput(commands);
  }

  /**
   * Processa entrada de gamepad diretamente
   */
  processGamepadInput(button?: number, axis?: number, axisValue?: number): EngineInput[] {
    const gamepadDevice = this.devices.get(InputDevice.GAMEPAD);
    if (!gamepadDevice) return [];

    const data: any = {};
    if (button !== undefined) data.button = button;
    if (axis !== undefined && axisValue !== undefined) {
      data.axis = axis;
      data.axisValue = axisValue;
    }

    const commands = gamepadDevice.processInput(data);
    return this.wrapCommandsInEngineInput(commands);
  }

  /**
   * Processa entrada touch diretamente
   */
  processTouchInput(x: number, y: number, type: string = 'tap'): EngineInput[] {
    const touchDevice = this.devices.get(InputDevice.TOUCH);
    if (!touchDevice) return [];

    const commands = touchDevice.processInput({ x, y, type });
    return this.wrapCommandsInEngineInput(commands);
  }

  /**
   * Processa entrada de voz diretamente
   */
  processVoiceInput(command: string, confidence?: number): EngineInput[] {
    const voiceDevice = this.devices.get(InputDevice.VOICE);
    if (!voiceDevice) return [];

    const commands = voiceDevice.processInput({ command, confidence });
    return this.wrapCommandsInEngineInput(commands);
  }

  /**
   * Força a execução da combinação pendente
   */
  flushPendingCommands(): EngineInput | null {
    if (this.pendingCommands.length > 0) {
      const result: EngineInput = {
        command: [...this.pendingCommands],
        timestamp: this.lastInputTime
      };
      
      this.pendingCommands = [];
      
      if (this.combinationTimer) {
        clearTimeout(this.combinationTimer);
        this.combinationTimer = null;
      }

      return result;
    }
    return null;
  }

  /**
   * Adiciona mapeamento de entrada
   */
  addMapping(mapping: InputMapping): void {
    this.config.mappings.push(mapping);
    
    // Atualiza dispositivo correspondente
    const device = this.devices.get(mapping.device);
    if (device) {
      device.addMapping(mapping.trigger, mapping.command);
    }
  }

  /**
   * Remove mapeamento de entrada
   */
  removeMapping(device: InputDevice, trigger: string | number): void {
    this.config.mappings = this.config.mappings.filter(
      m => !(m.device === device && m.trigger === trigger)
    );
    
    // Atualiza dispositivo correspondente
    const deviceInstance = this.devices.get(device);
    if (deviceInstance) {
      deviceInstance.removeMapping(trigger);
    }
  }

  /**
   * Obtém dispositivo específico
   */
  getDevice(deviceType: InputDevice): IInputDevice | undefined {
    return this.devices.get(deviceType);
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): InputProcessorConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<InputProcessorConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Reinicializa dispositivos se mapeamentos mudaram
    if (updates.mappings) {
      this.initializeDevices();
    }
  }

  /**
   * Obtém informações de debug de todos os dispositivos
   */
  getDebugInfo(): any {
    const devicesInfo: any = {};
    
    for (const [deviceType, device] of this.devices) {
      devicesInfo[deviceType] = device.getDebugInfo();
    }

    return {
      config: this.config,
      pendingCommands: this.pendingCommands,
      lastInputTime: this.lastInputTime,
      devices: devicesInfo
    };
  }

  // Métodos privados

  /**
   * Converte comandos universais em EngineInput
   */
  private wrapCommandsInEngineInput(commands: UniversalCommand[]): EngineInput[] {
    if (commands.length === 0) return [];
    
    return commands.map(command => ({
      command: [command],
      timestamp: Date.now()
    }));
  }

  /**
   * Mapeia entrada bruta para comandos usando dispositivos especializados
   */
  private mapRawInputToCommands(rawInput: RawInputEvent): UniversalCommand[] {
    const device = this.devices.get(rawInput.device);
    if (!device) return [];

    return device.processInput(rawInput.data);
  }
}
