import { 
  GameEngine, 
  GameContext, 
  GameState, 
  GameScene, 
  GameAction,
  EngineInput,
  CommandCombination,
  GameEvent,
  GameOutput
} from '../types/engine';

export class VGameEngine implements GameEngine {
  private context: GameContext;
  private isRunning: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(initialState?: Partial<GameState>) {
    // Inicializa o estado do jogo
    const defaultState: GameState = {
      currentScene: '',
      variables: {},
      history: [],
      player: {}
    };

    this.context = {
      state: { ...defaultState, ...initialState },
      scenes: new Map(),
      actions: new Map(),
      engine: this
    };

    // Registra ações básicas do sistema
    this.registerDefaultActions();
  }

  /**
   * Inicia a game engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.emitEvent({ type: 'error', data: { message: 'Game engine já está rodando' } });
      return;
    }

    this.isRunning = true;
    this.emitEvent({ type: 'engine_started' });
    
    // Se há uma cena inicial definida, muda para ela
    if (this.context.state.currentScene) {
      await this.changeScene(this.context.state.currentScene);
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
      this.emitEvent({ type: 'error', data: { message: 'Game engine já está parada' } });
      return;
    }

    this.isRunning = false;
    this.emitEvent({ type: 'engine_stopped' });
    
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
      this.emitEvent({ type: 'error', data: { message: 'Game engine não está rodando' } });
      return;
    }

    await this.executeCommand(input.command);
  }

  /**
   * Executa um comando universal
   */
  async executeCommand(command: CommandCombination): Promise<void> {
    try {
      // Busca ação global que corresponde ao comando
      const action = this.findActionForCommand(command);
      if (action) {
        await action.action(this.context);
        this.emitEvent({ 
          type: 'command_executed', 
          data: { command, action } 
        });
        return;
      }

      // Verifica se é uma escolha da cena atual
      const currentScene = this.getCurrentScene();
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

          this.emitEvent({ 
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
      this.emitEvent({ 
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
    const newScene = this.context.scenes.get(sceneId);
    if (!newScene) {
      this.emitEvent({ 
        type: 'error', 
        data: { message: `Cena não encontrada: ${sceneId}` } 
      });
      return;
    }

    const currentScene = this.getCurrentScene();
    const previousSceneId = this.context.state.currentScene;
    
    // Executa onExit da cena atual
    if (currentScene && currentScene.onExit) {
      try {
        await currentScene.onExit(this.context);
      } catch (error) {
        this.emitEvent({ 
          type: 'error', 
          data: { 
            message: `Erro ao sair da cena ${previousSceneId}`, 
            error 
          } 
        });
      }
    }

    // Atualiza estado
    this.context.state.currentScene = sceneId;
    this.context.state.history.push(`Mudou de "${previousSceneId}" para "${sceneId}"`);

    // Executa onEnter da nova cena
    if (newScene.onEnter) {
      try {
        await newScene.onEnter(this.context);
      } catch (error) {
        this.emitEvent({ 
          type: 'error', 
          data: { 
            message: `Erro ao entrar na cena ${sceneId}`, 
            error 
          } 
        });
      }
    }

    // Emite mudança de cena
    this.emitEvent({ 
      type: 'scene_changed', 
      data: { 
        previousScene: previousSceneId, 
        currentScene: sceneId, 
        scene: newScene 
      } 
    });

    // Mostra conteúdo da cena
    this.emitOutput({
      type: 'scene_change',
      content: `=== ${newScene.title} ===\n${newScene.description}`,
      timestamp: Date.now(),
      metadata: { scene: newScene }
    });

    // Mostra opções se houver
    if (newScene.choices && newScene.choices.length > 0) {
      const choicesText = newScene.choices
        .filter(choice => !choice.condition || choice.condition(this.context))
        .map((choice, index) => {
          const commandsText = choice.commands
            .map(cmd => `[${cmd.join(',')}]`)
            .join(' ou ');
          return `${index + 1}. ${choice.text} (${commandsText})`;
        })
        .join('\n');
      
      this.emitOutput({
        type: 'choice',
        content: `Opções:\n${choicesText}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Atualiza o estado do jogo
   */
  updateState(updates: Partial<GameState>): void {
    this.context.state = { ...this.context.state, ...updates };
    
    this.emitEvent({ 
      type: 'state_updated', 
      data: { updates, newState: this.context.state } 
    });
  }

  /**
   * Retorna o contexto atual do jogo
   */
  getContext(): GameContext {
    return this.context;
  }

  /**
   * Registra uma nova cena
   */
  registerScene(scene: GameScene): void {
    this.context.scenes.set(scene.id, scene);
  }

  /**
   * Registra uma nova ação global
   */
  registerAction(action: GameAction): void {
    this.context.actions.set(action.id, action);
  }

  /**
   * Remove uma cena
   */
  unregisterScene(sceneId: string): void {
    this.context.scenes.delete(sceneId);
  }

  /**
   * Remove uma ação
   */
  unregisterAction(actionId: string): void {
    this.context.actions.delete(actionId);
  }

  /**
   * Sistema de eventos - adiciona listener
   */
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Sistema de eventos - remove listener
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
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      isRunning: this.isRunning,
      currentScene: this.context.state.currentScene,
      scenesCount: this.context.scenes.size,
      actionsCount: this.context.actions.size,
      historyLength: this.context.state.history.length,
      variables: this.context.state.variables
    };
  }

  // Métodos privados

  private getCurrentScene(): GameScene | undefined {
    return this.context.scenes.get(this.context.state.currentScene);
  }

  private findActionForCommand(command: CommandCombination): GameAction | undefined {
    for (const action of this.context.actions.values()) {
      // Verifica condição se existir
      if (action.condition && !action.condition(this.context)) {
        continue;
      }

      // Verifica se algum comando da ação corresponde
      if (action.commands.some(cmdArray => this.arraysEqual(cmdArray, command))) {
        return action;
      }
    }
    return undefined;
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private emitEvent(event: GameEvent): void {
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

  private emitOutput(output: GameOutput): void {
    this.emitEvent({ type: 'output', data: output });
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
        const actions = Array.from(this.context.actions.values());
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
      action: () => {
        const { state } = this.context;
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
