import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface base para todos os dispositivos de entrada
 */
export interface IInputDevice {
  /**
   * Tipo do dispositivo
   */
  readonly deviceType: InputDevice;

  /**
   * Processa entrada bruta e retorna comandos universais
   */
  processInput(data: any): UniversalCommand[];

  /**
   * Obtém mapeamentos padrão para este dispositivo
   */
  getDefaultMappings(): InputMapping[];

  /**
   * Adiciona mapeamento personalizado
   */
  addMapping(trigger: string | number, command: UniversalCommand): void;

  /**
   * Remove mapeamento
   */
  removeMapping(trigger: string | number): void;

  /**
   * Obtém todos os mapeamentos atuais
   */
  getMappings(): InputMapping[];

  /**
   * Verifica se uma entrada corresponde a um mapeamento
   */
  matchesMapping(data: any, mapping: InputMapping): boolean;

  /**
   * Valida se os dados de entrada são válidos para este dispositivo
   */
  validateInput(data: any): boolean;

  /**
   * Obtém informações de debug sobre o dispositivo
   */
  getDebugInfo(): any;
}

/**
 * Classe base abstrata para dispositivos de entrada
 */
export abstract class BaseInputDevice implements IInputDevice {
  protected mappings: Map<string | number, UniversalCommand> = new Map();

  constructor(
    public readonly deviceType: InputDevice,
    customMappings?: InputMapping[]
  ) {
    // Carrega mapeamentos padrão
    const defaultMappings = this.getDefaultMappings();
    for (const mapping of defaultMappings) {
      this.mappings.set(mapping.trigger, mapping.command);
    }

    // Aplica mapeamentos personalizados se fornecidos
    if (customMappings) {
      for (const mapping of customMappings) {
        if (mapping.device === this.deviceType) {
          this.mappings.set(mapping.trigger, mapping.command);
        }
      }
    }
  }

  abstract getDefaultMappings(): InputMapping[];
  abstract matchesMapping(data: any, mapping: InputMapping): boolean;
  abstract validateInput(data: any): boolean;

  processInput(data: any): UniversalCommand[] {
    if (!this.validateInput(data)) {
      return [];
    }

    const commands: UniversalCommand[] = [];
    
    // Busca comando mapeado baseado nos dados de entrada
    const trigger = this.extractTrigger(data);
    const command = this.mappings.get(trigger);
    
    if (command) {
      commands.push(command);
    }

    return commands;
  }

  addMapping(trigger: string | number, command: UniversalCommand): void {
    this.mappings.set(trigger, command);
  }

  removeMapping(trigger: string | number): void {
    this.mappings.delete(trigger);
  }

  getMappings(): InputMapping[] {
    const mappings: InputMapping[] = [];
    
    for (const [trigger, command] of this.mappings.entries()) {
      mappings.push({
        device: this.deviceType,
        trigger,
        command
      });
    }

    return mappings;
  }

  /**
   * Obtém informações de debug básicas
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        trigger,
        command
      }))
    };
  }

  /**
   * Extrai o trigger dos dados de entrada específicos do dispositivo
   */
  protected abstract extractTrigger(data: any): string | number;
}
