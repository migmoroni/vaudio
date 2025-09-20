import { BaseInputDevice } from './BaseInputDevice';
import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface para dados de entrada touch
 */
export interface TouchInputData {
  x: number;
  y: number;
  type: 'tap' | 'swipe' | 'pinch' | 'long_press' | 'multi_touch';
  touches?: number; // número de dedos
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number; // distância do swipe/pinch
  duration?: number; // duração do toque em ms
  force?: number; // força do toque (se suportado)
}

/**
 * Configuração de gestos touch
 */
interface TouchGestureConfig {
  swipeThreshold: number; // distância mínima para reconhecer swipe
  longPressThreshold: number; // tempo mínimo para long press
  tapThreshold: number; // tempo máximo para tap
  pinchThreshold: number; // distância mínima para pinch
}

/**
 * Dispositivo de entrada para touch/tela sensível ao toque
 */
export class TouchInputDevice extends BaseInputDevice {
  private gestureConfig: TouchGestureConfig;
  private screenDimensions: { width: number; height: number };

  constructor(
    customMappings?: InputMapping[], 
    screenWidth: number = 1920, 
    screenHeight: number = 1080,
    gestureConfig?: Partial<TouchGestureConfig>
  ) {
    super(InputDevice.TOUCH, customMappings);
    
    this.screenDimensions = { width: screenWidth, height: screenHeight };
    this.gestureConfig = {
      swipeThreshold: 50,
      longPressThreshold: 500,
      tapThreshold: 200,
      pinchThreshold: 20,
      ...gestureConfig
    };
  }

  getDefaultMappings(): InputMapping[] {
    return [
      // Taps em diferentes áreas da tela (quadrantes)
      { device: InputDevice.TOUCH, trigger: 'tap_top_left', command: 1 },
      { device: InputDevice.TOUCH, trigger: 'tap_top_right', command: 2 },
      { device: InputDevice.TOUCH, trigger: 'tap_bottom_left', command: 3 },
      { device: InputDevice.TOUCH, trigger: 'tap_bottom_right', command: 4 },

      // Swipes direcionais
      { device: InputDevice.TOUCH, trigger: 'swipe_up', command: 1 },
      { device: InputDevice.TOUCH, trigger: 'swipe_right', command: 2 },
      { device: InputDevice.TOUCH, trigger: 'swipe_down', command: 3 },
      { device: InputDevice.TOUCH, trigger: 'swipe_left', command: 4 },

      // Gestos especiais
      { device: InputDevice.TOUCH, trigger: 'long_press', command: 1 },
      { device: InputDevice.TOUCH, trigger: 'double_tap', command: 2 },
      { device: InputDevice.TOUCH, trigger: 'pinch_in', command: 3 },
      { device: InputDevice.TOUCH, trigger: 'pinch_out', command: 4 },

      // Multi-touch
      { device: InputDevice.TOUCH, trigger: 'two_finger_tap', command: 1 },
      { device: InputDevice.TOUCH, trigger: 'three_finger_tap', command: 2 },
    ];
  }

  matchesMapping(data: TouchInputData, mapping: InputMapping): boolean {
    if (mapping.device !== InputDevice.TOUCH) {
      return false;
    }

    const trigger = this.extractTrigger(data);
    return trigger === mapping.trigger;
  }

  validateInput(data: any): boolean {
    return data && 
           typeof data.x === 'number' && 
           typeof data.y === 'number' && 
           typeof data.type === 'string';
  }

  protected extractTrigger(data: TouchInputData): string {
    switch (data.type) {
      case 'tap':
        return this.getTapQuadrant(data.x, data.y);
      
      case 'swipe':
        return `swipe_${data.direction}`;
      
      case 'long_press':
        return 'long_press';
      
      case 'pinch':
        // Baseado na distância para determinar pinch in/out
        return data.distance && data.distance > 0 ? 'pinch_out' : 'pinch_in';
      
      case 'multi_touch':
        return `${this.getTouchCountName(data.touches || 1)}_tap`;
      
      default:
        return 'unknown';
    }
  }

  /**
   * Processa toque simples
   */
  processTap(x: number, y: number, duration: number = 0): UniversalCommand[] {
    let type: 'tap' | 'long_press' = 'tap';
    
    if (duration > this.gestureConfig.longPressThreshold) {
      type = 'long_press';
    }

    const data: TouchInputData = {
      x,
      y,
      type,
      duration
    };

    return this.processInput(data);
  }

  /**
   * Processa swipe
   */
  processSwipe(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ): UniversalCommand[] {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Verifica se movimento é suficiente para ser swipe
    if (distance < this.gestureConfig.swipeThreshold) {
      return [];
    }

    // Determina direção predominante
    let direction: 'up' | 'down' | 'left' | 'right';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    const data: TouchInputData = {
      x: endX,
      y: endY,
      type: 'swipe',
      direction,
      distance
    };

    return this.processInput(data);
  }

  /**
   * Processa multi-touch
   */
  processMultiTouch(touches: Array<{x: number, y: number}>, touchCount: number): UniversalCommand[] {
    // Calcula centro dos toques
    const centerX = touches.reduce((sum, touch) => sum + touch.x, 0) / touches.length;
    const centerY = touches.reduce((sum, touch) => sum + touch.y, 0) / touches.length;

    const data: TouchInputData = {
      x: centerX,
      y: centerY,
      type: 'multi_touch',
      touches: touchCount
    };

    return this.processInput(data);
  }

  /**
   * Processa pinch (zoom)
   */
  processPinch(distance: number, centerX: number, centerY: number): UniversalCommand[] {
    const data: TouchInputData = {
      x: centerX,
      y: centerY,
      type: 'pinch',
      distance
    };

    return this.processInput(data);
  }

  /**
   * Define dimensões da tela
   */
  setScreenDimensions(width: number, height: number): void {
    this.screenDimensions = { width, height };
  }

  /**
   * Obtém dimensões da tela
   */
  getScreenDimensions(): { width: number; height: number } {
    return { ...this.screenDimensions };
  }

  /**
   * Atualiza configuração de gestos
   */
  updateGestureConfig(config: Partial<TouchGestureConfig>): void {
    this.gestureConfig = { ...this.gestureConfig, ...config };
  }

  /**
   * Obtém configuração de gestos
   */
  getGestureConfig(): TouchGestureConfig {
    return { ...this.gestureConfig };
  }

  /**
   * Adiciona mapeamento para área específica da tela
   */
  addTapAreaMapping(
    area: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right', 
    command: UniversalCommand
  ): void {
    this.addMapping(`tap_${area}`, command);
  }

  /**
   * Adiciona mapeamento para swipe direcional
   */
  addSwipeMapping(
    direction: 'up' | 'down' | 'left' | 'right', 
    command: UniversalCommand
  ): void {
    this.addMapping(`swipe_${direction}`, command);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      screenDimensions: this.screenDimensions,
      gestureConfig: this.gestureConfig,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        trigger,
        command,
        type: this.getGestureType(trigger as string)
      }))
    };
  }

  private getTapQuadrant(x: number, y: number): string {
    const midX = this.screenDimensions.width / 2;
    const midY = this.screenDimensions.height / 2;

    if (x < midX && y < midY) return 'tap_top_left';
    if (x >= midX && y < midY) return 'tap_top_right';
    if (x < midX && y >= midY) return 'tap_bottom_left';
    return 'tap_bottom_right';
  }

  private getTouchCountName(count: number): string {
    switch (count) {
      case 2: return 'two_finger';
      case 3: return 'three_finger';
      case 4: return 'four_finger';
      case 5: return 'five_finger';
      default: return 'multi_finger';
    }
  }

  private getGestureType(trigger: string): string {
    if (trigger.startsWith('tap_')) return 'tap';
    if (trigger.startsWith('swipe_')) return 'swipe';
    if (trigger.includes('finger')) return 'multi_touch';
    if (trigger.includes('pinch')) return 'pinch';
    if (trigger === 'long_press') return 'long_press';
    return 'unknown';
  }

  /**
   * Converte coordenadas de pixel para normalizada (0-1)
   */
  normalizeCoordinates(x: number, y: number): { x: number; y: number } {
    return {
      x: x / this.screenDimensions.width,
      y: y / this.screenDimensions.height
    };
  }

  /**
   * Converte coordenadas normalizadas para pixels
   */
  denormalizeCoordinates(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.screenDimensions.width,
      y: y * this.screenDimensions.height
    };
  }
}
