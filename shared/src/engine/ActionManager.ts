import { GameAction, GameContext, CommandCombination, GameOutput } from '../types/engine';
import { EventManager } from './EventManager';

/**
 * Gerenciador de ações do jogo
 * Responsável por gerenciar e executar ações globais
 */
export class ActionManager {
  private actions: Map<string, GameAction> = new Map();
  private eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.registerDefaultActions();
  }

  /**
   * Registra uma nova ação global
   */
  registerAction(action: GameAction): void {
    this.actions.set(action.id, action);
  }

  /**
   * Remove uma ação
   */
  unregisterAction(actionId: string): void {
    this.actions.delete(actionId);
  }

  /**
   * Obtém uma ação pelo ID
   */
  getAction(actionId: string): GameAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Lista todas as ações registradas
   */
  getAllActions(): GameAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Verifica se uma ação existe
   */
  hasAction(actionId: string): boolean {
    return this.actions.has(actionId);
  }

  /**
   * Busca uma ação que corresponde ao comando fornecido
   */
  findActionForCommand(command: CommandCombination, context: GameContext): GameAction | undefined {
    for (const action of this.actions.values()) {
      // Verifica condição se existir
      if (action.condition && !action.condition(context)) {
        continue;
      }

      // Verifica se algum comando da ação corresponde
      if (action.commands.some(cmdArray => this.arraysEqual(cmdArray, command))) {
        return action;
      }
    }
    return undefined;
  }

  /**
   * Executa uma ação específica
   */
  async executeAction(actionId: string, context: GameContext): Promise<boolean> {
    const action = this.actions.get(actionId);
    if (!action) {
      return false;
    }

    // Verifica condição se existir
    if (action.condition && !action.condition(context)) {
      this.emitOutput({
        type: 'text',
        content: `A ação "${action.name}" não está disponível no momento.`,
        timestamp: Date.now()
      });
      return false;
    }

    try {
      await action.action(context);
      this.eventManager.emit({
        type: 'command_executed',
        data: { command: [], action }
      });
      return true;
    } catch (error) {
      this.eventManager.emit({
        type: 'error',
        data: {
          message: `Erro ao executar ação ${actionId}`,
          error
        }
      });
      return false;
    }
  }

  /**
   * Executa ação baseada em comando
   */
  async executeCommandAction(command: CommandCombination, context: GameContext): Promise<boolean> {
    const action = this.findActionForCommand(command, context);
    if (!action) {
      return false;
    }

    try {
      await action.action(context);
      this.eventManager.emit({
        type: 'command_executed',
        data: { command, action }
      });
      return true;
    } catch (error) {
      this.eventManager.emit({
        type: 'error',
        data: {
          message: `Erro ao executar comando ${JSON.stringify(command)}`,
          error
        }
      });
      return false;
    }
  }

  /**
   * Retorna informações de debug sobre ações
   */
  getDebugInfo(): any {
    return {
      totalActions: this.actions.size,
      actionIds: Array.from(this.actions.keys())
    };
  }

  /**
   * Utilitário para comparar arrays de comandos
   */
  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  /**
   * Emite output para a interface
   */
  private emitOutput(output: GameOutput): void {
    this.eventManager.emit({ type: 'output', data: output });
  }

  /**
   * Registra ações básicas do sistema
   */
  private registerDefaultActions(): void {
    // Ação de ajuda
    this.registerAction({
      id: 'help',
      name: 'Ajuda',
      description: 'Mostra lista de comandos disponíveis',
      commands: [[1, 2, 3, 4]], // Combinação especial para ajuda
      action: () => {
        const actions = Array.from(this.actions.values());
        const helpText = actions.map(action => {
          const commandsText = action.commands
            .map(cmd => `[${cmd.join(',')}]`)
            .join(' ou ');
          return `${action.name}: ${action.description} (${commandsText})`;
        }).join('\n');

        this.emitOutput({
          type: 'text',
          content: `Comandos disponíveis:\n${helpText}`,
          timestamp: Date.now()
        });
      }
    });

    // Ação de status
    this.registerAction({
      id: 'status',
      name: 'Status',
      description: 'Mostra informações do estado atual',
      commands: [[2, 3, 4]], // Combinação para status
      action: (context: GameContext) => {
        const { state } = context;
        const statusText = [
          `Cena atual: ${state.currentScene}`,
          `Variáveis: ${JSON.stringify(state.variables, null, 2)}`,
          `Histórico: ${state.history.length} entradas`
        ].join('\n');

        this.emitOutput({
          type: 'text',
          content: statusText,
          timestamp: Date.now()
        });
      }
    });
  }
}
