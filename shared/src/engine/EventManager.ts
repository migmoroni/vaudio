import { GameEvent } from '../types/engine';

/**
 * Gerenciador de eventos do jogo
 * Responsável por gerenciar listeners e emissão de eventos
 */
export class EventManager {
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Adiciona um listener para um tipo de evento
   */
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove um listener específico
   */
  off(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Remove todos os listeners de um tipo de evento
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.eventListeners.delete(eventType);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Emite um evento para todos os listeners registrados
   */
  emit(event: GameEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Erro em listener do evento ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Retorna a quantidade de listeners para um tipo de evento
   */
  getListenerCount(eventType: string): number {
    const listeners = this.eventListeners.get(eventType);
    return listeners ? listeners.length : 0;
  }

  /**
   * Retorna todos os tipos de eventos que têm listeners
   */
  getEventTypes(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  /**
   * Verifica se existe pelo menos um listener para um tipo de evento
   */
  hasListeners(eventType: string): boolean {
    return this.getListenerCount(eventType) > 0;
  }
}
