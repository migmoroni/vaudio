import { BaseInputDevice } from './BaseInputDevice';
import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface para dados de entrada do teclado
 */
export interface KeyboardInputData {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

/**
 * Dispositivo de entrada para teclado
 */
export class KeyboardInputDevice extends BaseInputDevice {
  constructor(customMappings?: InputMapping[]) {
    super(InputDevice.KEYBOARD, customMappings);
  }

  getDefaultMappings(): InputMapping[] {
    return [
      // Comando 1 (TOP_LEFT) - Movimento para cima/norte
      { device: InputDevice.KEYBOARD, trigger: 'w', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: '1', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowup', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: 'numpad8', command: 1 },

      // Comando 2 (TOP_RIGHT) - Movimento para direita/leste
      { device: InputDevice.KEYBOARD, trigger: 'e', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: '2', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowright', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: 'numpad6', command: 2 },

      // Comando 3 (BOTTOM_LEFT) - Movimento para baixo/sul
      { device: InputDevice.KEYBOARD, trigger: 's', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: '3', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowdown', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: 'numpad2', command: 3 },

      // Comando 4 (BOTTOM_RIGHT) - Movimento para esquerda/oeste
      { device: InputDevice.KEYBOARD, trigger: 'd', command: 4 },
      { device: InputDevice.KEYBOARD, trigger: '4', command: 4 },
      { device: InputDevice.KEYBOARD, trigger: 'arrowleft', command: 4 },
      { device: InputDevice.KEYBOARD, trigger: 'numpad4', command: 4 },

      // Mapeamentos alternativos comuns
      { device: InputDevice.KEYBOARD, trigger: 'enter', command: 1 },
      { device: InputDevice.KEYBOARD, trigger: 'space', command: 2 },
      { device: InputDevice.KEYBOARD, trigger: 'escape', command: 3 },
      { device: InputDevice.KEYBOARD, trigger: 'backspace', command: 4 },
    ];
  }

  matchesMapping(data: KeyboardInputData, mapping: InputMapping): boolean {
    if (mapping.device !== InputDevice.KEYBOARD) {
      return false;
    }

    return data.key.toLowerCase() === mapping.trigger;
  }

  validateInput(data: any): boolean {
    return data && typeof data.key === 'string';
  }

  protected extractTrigger(data: KeyboardInputData): string {
    return data.key.toLowerCase();
  }

  /**
   * Processa entrada de teclado com suporte a modificadores
   */
  processKeyboardInput(
    key: string, 
    modifiers?: {
      ctrlKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
      metaKey?: boolean;
    }
  ): UniversalCommand[] {
    const data: KeyboardInputData = {
      key: key.toLowerCase(),
      ...modifiers
    };

    return this.processInput(data);
  }

  /**
   * Adiciona mapeamento com suporte a modificadores
   */
  addKeyMapping(
    key: string, 
    command: UniversalCommand,
    modifiers?: {
      ctrlKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
      metaKey?: boolean;
    }
  ): void {
    let trigger = key.toLowerCase();
    
    // Adiciona modificadores ao trigger se especificados
    if (modifiers) {
      const mods: string[] = [];
      if (modifiers.ctrlKey) mods.push('ctrl');
      if (modifiers.altKey) mods.push('alt');
      if (modifiers.shiftKey) mods.push('shift');
      if (modifiers.metaKey) mods.push('meta');
      
      if (mods.length > 0) {
        trigger = `${mods.join('+')}+${trigger}`;
      }
    }

    this.addMapping(trigger, command);
  }

  /**
   * Obtém informações de debug sobre mapeamentos do teclado
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        key: trigger,
        command
      }))
    };
  }

  /**
   * Verifica se uma tecla específica está mapeada
   */
  isKeyMapped(key: string): boolean {
    return this.mappings.has(key.toLowerCase());
  }

  /**
   * Obtém o comando associado a uma tecla
   */
  getCommandForKey(key: string): UniversalCommand | undefined {
    return this.mappings.get(key.toLowerCase());
  }

  /**
   * Remove todos os mapeamentos de uma tecla específica
   */
  removeKeyMappings(key: string): void {
    const lowerKey = key.toLowerCase();
    this.mappings.delete(lowerKey);
    
    // Remove também mapeamentos com modificadores
    const keysToRemove: (string | number)[] = [];
    for (const [trigger] of this.mappings) {
      if (typeof trigger === 'string' && trigger.endsWith(`+${lowerKey}`)) {
        keysToRemove.push(trigger);
      }
    }
    
    for (const key of keysToRemove) {
      this.mappings.delete(key);
    }
  }
}
