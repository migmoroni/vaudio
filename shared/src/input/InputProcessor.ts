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

export class InputProcessor {
  private config: InputProcessorConfig;
  private pendingCommands: UniversalCommand[] = [];
  private combinationTimer: NodeJS.Timeout | null = null;
  private lastInputTime: number = 0;

  constructor(config?: Partial<InputProcessorConfig>) {
    this.config = {
      mappings: this.getDefaultMappings(),
      combinationTimeout: 500, // 500ms para combinações
      enableCombinations: true,
      ...config
    };
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
    const rawInput: RawInputEvent = {
      device: InputDevice.KEYBOARD,
      data: { key: key.toLowerCase() },
      timestamp: Date.now()
    };

    return this.processRawInput(rawInput);
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
  }

  /**
   * Remove mapeamento de entrada
   */
  removeMapping(device: InputDevice, trigger: string | number): void {
    this.config.mappings = this.config.mappings.filter(
      m => !(m.device === device && m.trigger === trigger)
    );
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
  }

  // Métodos privados

  private mapRawInputToCommands(rawInput: RawInputEvent): UniversalCommand[] {
    const commands: UniversalCommand[] = [];

    for (const mapping of this.config.mappings) {
      if (mapping.device === rawInput.device) {
        if (this.inputMatchesMapping(rawInput, mapping)) {
          commands.push(mapping.command);
        }
      }
    }

    return commands;
  }

  private inputMatchesMapping(rawInput: RawInputEvent, mapping: InputMapping): boolean {
    switch (mapping.device) {
      case InputDevice.KEYBOARD:
        return rawInput.data.key === mapping.trigger;
      
      case InputDevice.MOUSE:
        return rawInput.data.button === mapping.trigger;
      
      case InputDevice.GAMEPAD:
        return rawInput.data.button === mapping.trigger;
      
      case InputDevice.TOUCH:
        return rawInput.data.gesture === mapping.trigger;
      
      case InputDevice.VOICE:
        return rawInput.data.command === mapping.trigger;
      
      default:
        return false;
    }
  }

  /**
   * Mapeamentos padrão para teclado
   */
  private getDefaultMappings(): InputMapping[] {
    return [
      // Comando 1 (TOP_LEFT)
      { device: InputDevice.KEYBOARD, trigger: 'w', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: '1', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowup', command: 1 },

      // Comando 2 (TOP_RIGHT)
      { device: InputDevice.KEYBOARD, trigger: 'e', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: '2', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowright', command: 2 },

      // Comando 3 (BOTTOM_LEFT)
      { device: InputDevice.KEYBOARD, trigger: 's', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: '3', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowdown', command: 3 },

      // Comando 4 (BOTTOM_RIGHT)
      { device: InputDevice.KEYBOARD, trigger: 'd', command: 4 },
      { device: InputDevice.KEYBOARD, trigger: '4', command: 4 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowleft', command: 4 },
    ];
  }
}
