import { GameState } from '../types/engine';
import { EventManager } from './EventManager';

/**
 * Gerenciador de estado do jogo
 * Responsável por gerenciar e atualizar o estado do jogo
 */
export class StateManager {
  private state: GameState;
  private eventManager: EventManager;

  constructor(eventManager: EventManager, initialState?: Partial<GameState>) {
    this.eventManager = eventManager;
    
    // Estado padrão
    const defaultState: GameState = {
      currentScene: '',
      variables: {},
      history: [],
      player: {}
    };

    this.state = { ...defaultState, ...initialState };
  }

  /**
   * Obtém o estado atual completo
   */
  getState(): GameState {
    return { ...this.state }; // Retorna uma cópia para evitar mutações diretas
  }

  /**
   * Atualiza o estado do jogo
   */
  updateState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };

    this.eventManager.emit({
      type: 'state_updated',
      data: { updates, newState: this.state }
    });
  }

  /**
   * Obtém o valor de uma variável específica
   */
  getVariable(key: string): any {
    return this.state.variables[key];
  }

  /**
   * Define o valor de uma variável
   */
  setVariable(key: string, value: any): void {
    this.state.variables[key] = value;
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { variables: { [key]: value } },
        newState: this.state 
      }
    });
  }

  /**
   * Remove uma variável
   */
  removeVariable(key: string): void {
    delete this.state.variables[key];
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { variables: this.state.variables },
        newState: this.state 
      }
    });
  }

  /**
   * Verifica se uma variável existe
   */
  hasVariable(key: string): boolean {
    return key in this.state.variables;
  }

  /**
   * Obtém todas as variáveis
   */
  getAllVariables(): Record<string, any> {
    return { ...this.state.variables };
  }

  /**
   * Limpa todas as variáveis
   */
  clearVariables(): void {
    this.state.variables = {};
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { variables: {} },
        newState: this.state 
      }
    });
  }

  /**
   * Obtém a cena atual
   */
  getCurrentScene(): string {
    return this.state.currentScene;
  }

  /**
   * Define a cena atual
   */
  setCurrentScene(sceneId: string): void {
    const previousScene = this.state.currentScene;
    this.state.currentScene = sceneId;
    
    // Adiciona ao histórico se mudou de cena
    if (previousScene !== sceneId) {
      this.addToHistory(`Mudou de "${previousScene}" para "${sceneId}"`);
    }

    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { currentScene: sceneId },
        newState: this.state 
      }
    });
  }

  /**
   * Adiciona uma entrada ao histórico
   */
  addToHistory(entry: string): void {
    this.state.history.push(entry);
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { history: [...this.state.history] },
        newState: this.state 
      }
    });
  }

  /**
   * Obtém o histórico completo
   */
  getHistory(): string[] {
    return [...this.state.history];
  }

  /**
   * Limpa o histórico
   */
  clearHistory(): void {
    this.state.history = [];
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { history: [] },
        newState: this.state 
      }
    });
  }

  /**
   * Obtém informações do jogador
   */
  getPlayer(): typeof this.state.player {
    return { ...this.state.player };
  }

  /**
   * Atualiza informações do jogador
   */
  updatePlayer(playerUpdates: Partial<typeof this.state.player>): void {
    this.state.player = { ...this.state.player, ...playerUpdates };
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { player: this.state.player },
        newState: this.state 
      }
    });
  }

  /**
   * Obtém estatística específica do jogador
   */
  getPlayerStat(statName: string): any {
    return this.state.player.stats?.[statName];
  }

  /**
   * Define estatística do jogador
   */
  setPlayerStat(statName: string, value: any): void {
    if (!this.state.player.stats) {
      this.state.player.stats = {};
    }
    
    this.state.player.stats[statName] = value;
    
    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: { player: this.state.player },
        newState: this.state 
      }
    });
  }

  /**
   * Reseta o estado para valores padrão
   */
  reset(newInitialState?: Partial<GameState>): void {
    const defaultState: GameState = {
      currentScene: '',
      variables: {},
      history: [],
      player: {}
    };

    this.state = { ...defaultState, ...newInitialState };

    this.eventManager.emit({
      type: 'state_updated',
      data: { 
        updates: this.state,
        newState: this.state 
      }
    });
  }

  /**
   * Retorna informações de debug sobre o estado
   */
  getDebugInfo(): any {
    return {
      currentScene: this.state.currentScene,
      variableCount: Object.keys(this.state.variables).length,
      historyLength: this.state.history.length,
      playerName: this.state.player.name,
      playerStats: this.state.player.stats ? Object.keys(this.state.player.stats).length : 0
    };
  }
}
