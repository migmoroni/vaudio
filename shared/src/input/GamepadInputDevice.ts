import { BaseInputDevice } from './BaseInputDevice';
import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface para dados de entrada do gamepad
 */
export interface GamepadInputData {
  button?: number;
  axis?: number;
  axisValue?: number; // -1 a 1
  type?: 'button' | 'axis' | 'dpad';
  dpad?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Mapeamento padrão de botões do gamepad (Xbox/PlayStation)
 */
export enum GamepadButton {
  A = 0,          // Xbox A / PlayStation X
  B = 1,          // Xbox B / PlayStation Circle
  X = 2,          // Xbox X / PlayStation Square
  Y = 3,          // Xbox Y / PlayStation Triangle
  LB = 4,         // Left Bumper / L1
  RB = 5,         // Right Bumper / R1
  LT = 6,         // Left Trigger / L2
  RT = 7,         // Right Trigger / R2
  BACK = 8,       // Back / Select
  START = 9,      // Start / Menu
  LS = 10,        // Left Stick Click / L3
  RS = 11,        // Right Stick Click / R3
  DPAD_UP = 12,   // D-Pad Up
  DPAD_DOWN = 13, // D-Pad Down
  DPAD_LEFT = 14, // D-Pad Left
  DPAD_RIGHT = 15 // D-Pad Right
}

/**
 * Dispositivo de entrada para gamepad
 */
export class GamepadInputDevice extends BaseInputDevice {
  private deadZone: number = 0.1;
  private axisThreshold: number = 0.5;

  constructor(customMappings?: InputMapping[], deadZone: number = 0.1) {
    super(InputDevice.GAMEPAD, customMappings);
    this.deadZone = deadZone;
  }

  getDefaultMappings(): InputMapping[] {
    return [
      // Botões principais (face buttons)
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.A, command: 1 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.B, command: 2 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.X, command: 3 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.Y, command: 4 },

      // D-Pad
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.DPAD_UP, command: 1 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.DPAD_RIGHT, command: 2 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.DPAD_DOWN, command: 3 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.DPAD_LEFT, command: 4 },

      // Bumpers
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.LB, command: 1 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.RB, command: 2 },

      // Triggers
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.LT, command: 3 },
      { device: InputDevice.GAMEPAD, trigger: GamepadButton.RT, command: 4 },

      // Sticks (movimento)
      { device: InputDevice.GAMEPAD, trigger: 'left_stick_up', command: 1 },
      { device: InputDevice.GAMEPAD, trigger: 'left_stick_right', command: 2 },
      { device: InputDevice.GAMEPAD, trigger: 'left_stick_down', command: 3 },
      { device: InputDevice.GAMEPAD, trigger: 'left_stick_left', command: 4 },

      { device: InputDevice.GAMEPAD, trigger: 'right_stick_up', command: 1 },
      { device: InputDevice.GAMEPAD, trigger: 'right_stick_right', command: 2 },
      { device: InputDevice.GAMEPAD, trigger: 'right_stick_down', command: 3 },
      { device: InputDevice.GAMEPAD, trigger: 'right_stick_left', command: 4 },
    ];
  }

  matchesMapping(data: GamepadInputData, mapping: InputMapping): boolean {
    if (mapping.device !== InputDevice.GAMEPAD) {
      return false;
    }

    // Compara botão
    if (typeof mapping.trigger === 'number' && data.button !== undefined) {
      return data.button === mapping.trigger;
    }

    // Compara eixo/stick
    if (typeof mapping.trigger === 'string') {
      const trigger = this.extractTrigger(data);
      return trigger === mapping.trigger;
    }

    return false;
  }

  validateInput(data: any): boolean {
    return data && (
      typeof data.button === 'number' ||
      (typeof data.axis === 'number' && typeof data.axisValue === 'number') ||
      typeof data.dpad === 'string'
    );
  }

  protected extractTrigger(data: GamepadInputData): string | number {
    // Botão do gamepad
    if (typeof data.button === 'number') {
      return data.button;
    }

    // D-Pad
    if (data.dpad) {
      return `dpad_${data.dpad}`;
    }

    // Analógico/Stick
    if (data.axis !== undefined && data.axisValue !== undefined) {
      // Aplica dead zone
      if (Math.abs(data.axisValue) < this.deadZone) {
        return 'none';
      }

      // Só registra se passar do threshold
      if (Math.abs(data.axisValue) < this.axisThreshold) {
        return 'none';
      }

      const stickName = this.getStickName(data.axis);
      const direction = data.axisValue > 0 ? this.getPositiveDirection(data.axis) : this.getNegativeDirection(data.axis);
      
      return `${stickName}_${direction}`;
    }

    return 'unknown';
  }

  /**
   * Processa botão do gamepad
   */
  processGamepadButton(button: number, pressed: boolean): UniversalCommand[] {
    if (!pressed) {
      return []; // Só processa quando botão é pressionado
    }

    const data: GamepadInputData = {
      button,
      type: 'button'
    };

    return this.processInput(data);
  }

  /**
   * Processa movimento do analógico
   */
  processGamepadAxis(axis: number, value: number): UniversalCommand[] {
    const data: GamepadInputData = {
      axis,
      axisValue: value,
      type: 'axis'
    };

    return this.processInput(data);
  }

  /**
   * Processa D-Pad
   */
  processGamepadDPad(direction: 'up' | 'down' | 'left' | 'right'): UniversalCommand[] {
    const data: GamepadInputData = {
      dpad: direction,
      type: 'dpad'
    };

    return this.processInput(data);
  }

  /**
   * Define dead zone para analógicos
   */
  setDeadZone(deadZone: number): void {
    this.deadZone = Math.max(0, Math.min(1, deadZone));
  }

  /**
   * Define threshold para movimento dos analógicos
   */
  setAxisThreshold(threshold: number): void {
    this.axisThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Obtém dead zone atual
   */
  getDeadZone(): number {
    return this.deadZone;
  }

  /**
   * Obtém threshold atual
   */
  getAxisThreshold(): number {
    return this.axisThreshold;
  }

  /**
   * Adiciona mapeamento para botão específico
   */
  addButtonMapping(button: GamepadButton, command: UniversalCommand): void {
    this.addMapping(button, command);
  }

  /**
   * Adiciona mapeamento para movimento do stick
   */
  addStickMapping(
    stick: 'left' | 'right', 
    direction: 'up' | 'down' | 'left' | 'right', 
    command: UniversalCommand
  ): void {
    this.addMapping(`${stick}_stick_${direction}`, command);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      deadZone: this.deadZone,
      axisThreshold: this.axisThreshold,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        trigger,
        command,
        type: typeof trigger === 'number' ? 'button' : 'axis'
      }))
    };
  }

  private getStickName(axis: number): string {
    // Eixos 0 e 1 são geralmente o stick esquerdo
    // Eixos 2 e 3 são geralmente o stick direito
    return axis < 2 ? 'left_stick' : 'right_stick';
  }

  private getPositiveDirection(axis: number): string {
    // Eixos pares (0, 2) são geralmente horizontais (direita = positivo)
    // Eixos ímpares (1, 3) são geralmente verticais (baixo = positivo)
    return axis % 2 === 0 ? 'right' : 'down';
  }

  private getNegativeDirection(axis: number): string {
    // Eixos pares (0, 2) são geralmente horizontais (esquerda = negativo)
    // Eixos ímpares (1, 3) são geralmente verticais (cima = negativo)
    return axis % 2 === 0 ? 'left' : 'up';
  }

  /**
   * Verifica se um botão está mapeado
   */
  isButtonMapped(button: GamepadButton): boolean {
    return this.mappings.has(button);
  }

  /**
   * Obtém comando para um botão específico
   */
  getCommandForButton(button: GamepadButton): UniversalCommand | undefined {
    return this.mappings.get(button);
  }
}
