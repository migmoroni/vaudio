import { 
  GameEngine, 
  GameContext, 
  GameState, 
  GameScene, 
  GameAction,
  EngineInput,
  CommandCombination,
  GameOutput
} from '../types/engine';
import { EventManager } from './EventManager';
import { SceneManager } from './SceneManager';
import { ActionManager } from './ActionManager';
import { StateManager } from './StateManager';

export class VGameEngine implements GameEngine {
  private context: GameContext;
  private isRunning: boolean = false;
  
  // Managers especializados
  private eventManager: EventManager;
  private sceneManager: SceneManager;
  private actionManager: ActionManager;
  private stateManager: StateManager;

  constructor(initialState?: Partial<GameState>) {
    // Inicializa managers
    this.eventManager = new EventManager();
    this.stateManager = new StateManager(this.eventManager, initialState);
    this.sceneManager = new SceneManager(this.eventManager);
    this.actionManager = new ActionManager(this.eventManager);

    // Inicializa contexto
    this.context = {
      state: this.stateManager.getState(),
      scenes: new Map(),
      actions: new Map(),
      engine: this
    };
  }

  /**
   * Inicia a game engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.eventManager.emit({ type: 'error', data: { message: 'Game engine já está rodando' } });
      return;
    }

    this.isRunning = true;
    this.eventManager.emit({ type: 'engine_started' });
    
    // Se há uma cena inicial definida, muda para ela
    const currentScene = this.stateManager.getCurrentScene();
    if (currentScene) {
      await this.changeScene(currentScene);
    }

    this.emitOutput({
      type: 'text',
      content: 'Game engine iniciada',
      timestamp: Date.now()
    });
  }

  /**
   * Para a game engine
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.eventManager.emit({ type: 'error', data: { message: 'Game engine já está parada' } });
      return;
    }

    this.isRunning = false;
    this.eventManager.emit({ type: 'engine_stopped' });
    
    this.emitOutput({
      type: 'text',
      content: 'Game engine parada',
      timestamp: Date.now()
    });
  }

  /**
   * Processa entrada da engine (comandos universais)
   */
  async processInput(input: EngineInput): Promise<void> {
    if (!this.isRunning) {
      this.eventManager.emit({ type: 'error', data: { message: 'Game engine não está rodando' } });
      return;
    }

    await this.executeCommand(input.command);
  }

  /**
   * Executa um comando universal
   */
  async executeCommand(command: CommandCombination): Promise<void> {
    try {
      // Atualiza contexto com estado atual
      this.updateContext();

      // Busca ação global que corresponde ao comando
      const actionExecuted = await this.actionManager.executeCommandAction(command, this.context);
      if (actionExecuted) {
        return;
      }

      // Verifica se é uma escolha da cena atual
      const currentScene = this.sceneManager.getCurrentScene();
      if (currentScene && currentScene.choices) {
        const choice = currentScene.choices.find(choice =>
          choice.commands.some(cmdArray => this.arraysEqual(cmdArray, command))
        );

        if (choice) {
          // Verifica condição se existir
          if (choice.condition && !choice.condition(this.context)) {
            this.emitOutput({
              type: 'text',
              content: 'Esta opção não está disponível no momento.',
              timestamp: Date.now()
            });
            return;
          }

          await choice.action(this.context);
          
          // Muda de cena se especificado
          if (choice.nextScene) {
            await this.changeScene(choice.nextScene);
          }

          this.eventManager.emit({ 
            type: 'command_executed', 
            data: { command } 
          });
          return;
        }
      }

      // Comando não reconhecido
      this.emitOutput({
        type: 'text',
        content: `Comando ${JSON.stringify(command)} não reconhecido neste contexto.`,
        timestamp: Date.now()
      });

    } catch (error) {
      this.eventManager.emit({ 
        type: 'error', 
        data: { 
          message: `Erro ao executar comando ${JSON.stringify(command)}`, 
          error 
        } 
      });
    }
  }

  /**
   * Muda para uma nova cena
   */
  async changeScene(sceneId: string): Promise<void> {
    this.updateContext();
    await this.sceneManager.changeScene(sceneId, this.context);
    
    // Atualiza estado após mudança de cena
    this.stateManager.setCurrentScene(sceneId);
    this.updateContext();
  }

  /**
   * Atualiza o estado do jogo
   */
  updateState(updates: Partial<GameState>): void {
    this.stateManager.updateState(updates);
    this.updateContext();
  }

  /**
   * Retorna o contexto atual do jogo
   */
  getContext(): GameContext {
    this.updateContext();
    return this.context;
  }

  /**
   * Registra uma nova cena
   */
  registerScene(scene: GameScene): void {
    this.sceneManager.registerScene(scene);
    this.updateContext();
  }

  /**
   * Registra uma nova ação global
   */
  registerAction(action: GameAction): void {
    this.actionManager.registerAction(action);
    this.updateContext();
  }

  /**
   * Remove uma cena
   */
  unregisterScene(sceneId: string): void {
    this.sceneManager.unregisterScene(sceneId);
    this.updateContext();
  }

  /**
   * Remove uma ação
   */
  unregisterAction(actionId: string): void {
    this.actionManager.unregisterAction(actionId);
    this.updateContext();
  }

  /**
   * Sistema de eventos - adiciona listener
   */
  on(eventType: string, callback: Function): void {
    this.eventManager.on(eventType, callback);
  }

  /**
   * Sistema de eventos - remove listener
   */
  off(eventType: string, callback: Function): void {
    this.eventManager.off(eventType, callback);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      isRunning: this.isRunning,
      state: this.stateManager.getDebugInfo(),
      scenes: this.sceneManager.getDebugInfo(),
      actions: this.actionManager.getDebugInfo(),
      events: {
        eventTypes: this.eventManager.getEventTypes(),
        totalListeners: this.eventManager.getEventTypes().reduce(
          (total, type) => total + this.eventManager.getListenerCount(type), 0
        )
      }
    };
  }

  // Métodos privados

  /**
   * Atualiza o contexto com dados dos managers
   */
  private updateContext(): void {
    this.context.state = this.stateManager.getState();
    
    // Atualiza maps com dados dos managers
    this.context.scenes.clear();
    this.sceneManager.getAllScenes().forEach(scene => {
      this.context.scenes.set(scene.id, scene);
    });

    this.context.actions.clear();
    this.actionManager.getAllActions().forEach(action => {
      this.context.actions.set(action.id, action);
    });
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
}
