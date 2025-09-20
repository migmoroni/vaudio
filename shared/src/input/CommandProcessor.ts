import { 
  GameCommand, 
  BasicCommand, 
  CombinedCommand,
  CommandEvent,
  CommandCombination,
  CommandProcessorConfig,
  numberToBasicCommand,
  isValidCombination
} from './CommandTypes';

/**
 * Callback para quando um comando é processado
 */
export type CommandCallback = (commandEvent: CommandEvent) => void;

/**
 * Processador de comandos que converte entradas em comandos de jogo
 */
export class CommandProcessor {
  private config: CommandProcessorConfig;
  private currentCombination: CommandCombination | null = null;
  private callbacks: CommandCallback[] = [];

  constructor(config?: Partial<CommandProcessorConfig>) {
    this.config = {
      combinationTimeout: 500, // 500ms para detectar combinações
      enableCombinations: true,
      debugMode: false,
      ...config
    };
  }

  /**
   * Registra callback para receber comandos processados
   */
  onCommand(callback: CommandCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: CommandCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Processa entrada numérica do dispositivo de entrada
   */
  processInput(commandNumber: number, device: string, originalInput?: any): void {
    const basicCommand = numberToBasicCommand(commandNumber);
    if (!basicCommand) {
      if (this.config.debugMode) {
        console.warn(`[CommandProcessor] Comando inválido: ${commandNumber}`);
      }
      return;
    }

    if (this.config.enableCombinations) {
      this.handleCombinationInput(basicCommand, device, originalInput);
    } else {
      // Sem combinações, emite comando imediatamente
      this.emitCommand(basicCommand, device, originalInput);
    }
  }

  /**
   * Processa entrada para possíveis combinações
   */
  private handleCombinationInput(command: BasicCommand, device: string, originalInput?: any): void {
    const now = Date.now();

    if (!this.currentCombination) {
      // Primeira entrada - inicia combinação
      this.startCombination(command, device, originalInput, now);
    } else {
      // Entrada adicional - verifica se forma combinação válida
      if (this.currentCombination.commands.has(command)) {
        // Comando repetido - ignora
        if (this.config.debugMode) {
          console.log(`[CommandProcessor] Comando repetido ignorado: ${command}`);
        }
        return;
      }

      // Adiciona comando à combinação
      this.currentCombination.commands.add(command);

      // Verifica se formou combinação válida
      const validCombination = isValidCombination(this.currentCombination.commands);
      
      if (validCombination) {
        // Combinação válida encontrada
        this.completeCombination(validCombination, device, originalInput);
      } else if (this.currentCombination.commands.size >= 2) {
        // Combinação inválida - emite comandos individuais
        this.handleInvalidCombination(device, originalInput);
      }
    }
  }

  /**
   * Inicia nova combinação
   */
  private startCombination(command: BasicCommand, device: string, originalInput: any, timestamp: number): void {
    this.currentCombination = {
      commands: new Set([command]),
      startTime: timestamp,
      timeout: setTimeout(() => {
        // Timeout - emite comando individual
        if (this.currentCombination) {
          const soloCommand = Array.from(this.currentCombination.commands)[0];
          this.emitCommand(soloCommand, device, originalInput);
          this.clearCombination();
        }
      }, this.config.combinationTimeout)
    };

    if (this.config.debugMode) {
      console.log(`[CommandProcessor] Iniciou combinação com: ${command}`);
    }
  }

  /**
   * Completa combinação válida
   */
  private completeCombination(combination: CombinedCommand, device: string, originalInput: any): void {
    if (this.config.debugMode) {
      console.log(`[CommandProcessor] Combinação válida: ${combination}`);
    }

    this.clearCombination();
    this.emitCommand(combination, device, originalInput);
  }

  /**
   * Lida com combinação inválida
   */
  private handleInvalidCombination(device: string, originalInput: any): void {
    if (this.currentCombination) {
      if (this.config.debugMode) {
        console.log(`[CommandProcessor] Combinação inválida, emitindo comandos individuais`);
      }

      // Emite todos os comandos individuais em ordem
      const commands = Array.from(this.currentCombination.commands).sort();
      this.clearCombination();
      
      commands.forEach(cmd => {
        this.emitCommand(cmd, device, originalInput);
      });
    }
  }

  /**
   * Limpa combinação atual
   */
  private clearCombination(): void {
    if (this.currentCombination) {
      clearTimeout(this.currentCombination.timeout);
      this.currentCombination = null;
    }
  }

  /**
   * Emite comando processado para todos os callbacks
   */
  private emitCommand(command: GameCommand, device: string, originalInput?: any): void {
    const commandEvent: CommandEvent = {
      command,
      timestamp: Date.now(),
      device,
      originalInput
    };

    if (this.config.debugMode) {
      console.log(`[CommandProcessor] Emitindo comando: ${command} de ${device}`);
    }

    this.callbacks.forEach(callback => {
      try {
        callback(commandEvent);
      } catch (error) {
        console.error(`[CommandProcessor] Erro ao executar callback:`, error);
      }
    });
  }

  /**
   * Força emissão de comando individual (para casos especiais)
   */
  forceCommand(command: GameCommand, device: string, originalInput?: any): void {
    this.clearCombination(); // Cancela qualquer combinação em andamento
    this.emitCommand(command, device, originalInput);
  }

  /**
   * Cancela combinação em andamento
   */
  cancelCombination(): void {
    if (this.config.debugMode && this.currentCombination) {
      console.log(`[CommandProcessor] Combinação cancelada`);
    }
    this.clearCombination();
  }

  /**
   * Obtém estado atual para debug
   */
  getDebugInfo(): any {
    return {
      config: this.config,
      hasCombination: !!this.currentCombination,
      currentCommands: this.currentCombination ? Array.from(this.currentCombination.commands) : [],
      callbackCount: this.callbacks.length
    };
  }

  /**
   * Cleanup - remove todos os timers
   */
  destroy(): void {
    this.clearCombination();
    this.callbacks.length = 0;
  }
}
