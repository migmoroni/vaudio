import { BaseInputDevice } from './BaseInputDevice';
import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface para dados de entrada do mouse
 */
export interface MouseInputData {
  button?: number; // 0=left, 1=middle, 2=right
  x?: number;
  y?: number;
  deltaX?: number;
  deltaY?: number;
  wheel?: number; // scroll wheel delta
  type?: 'click' | 'move' | 'wheel' | 'drag';
}

/**
 * Dispositivo de entrada para mouse
 */
export class MouseInputDevice extends BaseInputDevice {
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  private sensitivity: number = 1.0;

  constructor(customMappings?: InputMapping[], sensitivity: number = 1.0) {
    super(InputDevice.MOUSE, customMappings);
    this.sensitivity = sensitivity;
  }

  getDefaultMappings(): InputMapping[] {
    return [
      // Botões do mouse
      { device: InputDevice.MOUSE, trigger: 0, command: 1 }, // Botão esquerdo
      { device: InputDevice.MOUSE, trigger: 2, command: 2 }, // Botão direito
      { device: InputDevice.MOUSE, trigger: 1, command: 3 }, // Botão do meio
      
      // Scroll wheel
      { device: InputDevice.MOUSE, trigger: 'wheel_up', command: 1 },
      { device: InputDevice.MOUSE, trigger: 'wheel_down', command: 3 },
      
      // Gestos de movimento (baseado em quadrantes)
      { device: InputDevice.MOUSE, trigger: 'move_up', command: 1 },
      { device: InputDevice.MOUSE, trigger: 'move_right', command: 2 },
      { device: InputDevice.MOUSE, trigger: 'move_down', command: 3 },
      { device: InputDevice.MOUSE, trigger: 'move_left', command: 4 },
    ];
  }

  matchesMapping(data: MouseInputData, mapping: InputMapping): boolean {
    if (mapping.device !== InputDevice.MOUSE) {
      return false;
    }

    // Compara botão do mouse
    if (typeof mapping.trigger === 'number') {
      return data.button === mapping.trigger;
    }

    // Compara eventos especiais (wheel, movimento)
    if (typeof mapping.trigger === 'string') {
      const trigger = this.extractTrigger(data);
      return trigger === mapping.trigger;
    }

    return false;
  }

  validateInput(data: any): boolean {
    return data && (
      typeof data.button === 'number' ||
      typeof data.wheel === 'number' ||
      (typeof data.deltaX === 'number' && typeof data.deltaY === 'number')
    );
  }

  protected extractTrigger(data: MouseInputData): string | number {
    // Botão do mouse
    if (typeof data.button === 'number') {
      return data.button;
    }

    // Scroll wheel
    if (typeof data.wheel === 'number') {
      return data.wheel > 0 ? 'wheel_up' : 'wheel_down';
    }

    // Movimento do mouse
    if (data.deltaX !== undefined && data.deltaY !== undefined) {
      const absX = Math.abs(data.deltaX);
      const absY = Math.abs(data.deltaY);

      // Determina direção predominante
      if (absX > absY) {
        return data.deltaX > 0 ? 'move_right' : 'move_left';
      } else {
        return data.deltaY > 0 ? 'move_down' : 'move_up';
      }
    }

    return 'unknown';
  }

  /**
   * Processa clique do mouse
   */
  processMouseClick(
    button: number, 
    x?: number, 
    y?: number
  ): UniversalCommand[] {
    const data: MouseInputData = {
      button,
      x,
      y,
      type: 'click'
    };

    return this.processInput(data);
  }

  /**
   * Processa movimento do mouse
   */
  processMouseMove(x: number, y: number): UniversalCommand[] {
    const deltaX = x - this.lastPosition.x;
    const deltaY = y - this.lastPosition.y;

    this.lastPosition = { x, y };

    // Aplica sensibilidade
    const adjustedDeltaX = deltaX * this.sensitivity;
    const adjustedDeltaY = deltaY * this.sensitivity;

    // Só processa se o movimento for significativo
    const threshold = 10;
    if (Math.abs(adjustedDeltaX) < threshold && Math.abs(adjustedDeltaY) < threshold) {
      return [];
    }

    const data: MouseInputData = {
      x,
      y,
      deltaX: adjustedDeltaX,
      deltaY: adjustedDeltaY,
      type: 'move'
    };

    return this.processInput(data);
  }

  /**
   * Processa scroll do mouse
   */
  processMouseWheel(delta: number): UniversalCommand[] {
    const data: MouseInputData = {
      wheel: delta,
      type: 'wheel'
    };

    return this.processInput(data);
  }

  /**
   * Define sensibilidade do mouse
   */
  setSensitivity(sensitivity: number): void {
    this.sensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
  }

  /**
   * Obtém sensibilidade atual
   */
  getSensitivity(): number {
    return this.sensitivity;
  }

  /**
   * Adiciona mapeamento para botão específico
   */
  addButtonMapping(button: number, command: UniversalCommand): void {
    this.addMapping(button, command);
  }

  /**
   * Adiciona mapeamento para gesto de movimento
   */
  addMovementMapping(direction: 'up' | 'down' | 'left' | 'right', command: UniversalCommand): void {
    this.addMapping(`move_${direction}`, command);
  }

  /**
   * Adiciona mapeamento para scroll
   */
  addWheelMapping(direction: 'up' | 'down', command: UniversalCommand): void {
    this.addMapping(`wheel_${direction}`, command);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      sensitivity: this.sensitivity,
      lastPosition: this.lastPosition,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        trigger,
        command,
        type: typeof trigger === 'number' ? 'button' : 'gesture'
      }))
    };
  }

  /**
   * Reseta posição do mouse
   */
  resetPosition(): void {
    this.lastPosition = { x: 0, y: 0 };
  }

  /**
   * Verifica se um botão está mapeado
   */
  isButtonMapped(button: number): boolean {
    return this.mappings.has(button);
  }

  /**
   * Obtém comando para um botão específico
   */
  getCommandForButton(button: number): UniversalCommand | undefined {
    return this.mappings.get(button);
  }
}
