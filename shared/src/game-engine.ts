import { 
  GameEngine, 
  GameContext, 
  GameState, 
  GameScene, 
  Command, 
  InputEvent 
} from './types';
import { InputProcessor } from './input-processor';

export class VGameEngine implements GameEngine {
  private context: GameContext;
  private inputProcessor: InputProcessor;
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
      commands: new Map(),
      engine: this
    };

    // Inicializa o processador de input
    this.inputProcessor = new InputProcessor(this.context);
    
    // Registra comandos básicos
    this.registerDefaultCommands();
  }

  /**
   * Inicia a game engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Game engine já está rodando');
      return;
    }

    this.isRunning = true;
    this.emit('engine:started');
    
    // Se há uma cena inicial definida, muda para ela
    if (this.context.state.currentScene) {
      await this.changeScene(this.context.state.currentScene);
    }

    console.log('Game engine iniciada');
  }

  /**
   * Para a game engine
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('Game engine já está parada');
      return;
    }

    this.isRunning = false;
    this.emit('engine:stopped');
    console.log('Game engine parada');
  }

  /**
   * Processa um evento de input
   */
  async processInput(event: InputEvent): Promise<void> {
    if (!this.isRunning) {
      console.warn('Game engine não está rodando');
      return;
    }

    this.inputProcessor.processInput(event);
    this.emit('input:processed', event);
  }

  /**
   * Executa um comando pelo ID
   */
  async executeCommand(commandId: string): Promise<void> {
    const command = this.context.commands.get(commandId);
    if (!command) {
      console.error(`Comando não encontrado: ${commandId}`);
      return;
    }

    try {
      await command.action(this.context);
      this.emit('command:executed', { commandId, command });
    } catch (error) {
      console.error(`Erro ao executar comando ${commandId}:`, error);
      this.emit('command:error', { commandId, error });
    }
  }

  /**
   * Muda para uma nova cena
   */
  async changeScene(sceneId: string): Promise<void> {
    const newScene = this.context.scenes.get(sceneId);
    if (!newScene) {
      console.error(`Cena não encontrada: ${sceneId}`);
      return;
    }

    const currentScene = this.context.scenes.get(this.context.state.currentScene);
    
    // Executa onExit da cena atual
    if (currentScene && currentScene.onExit) {
      try {
        await currentScene.onExit(this.context);
      } catch (error) {
        console.error(`Erro ao sair da cena ${this.context.state.currentScene}:`, error);
      }
    }

    // Atualiza estado
    const previousScene = this.context.state.currentScene;
    this.context.state.currentScene = sceneId;
    this.context.state.history.push(`Mudou de "${previousScene}" para "${sceneId}"`);

    // Executa onEnter da nova cena
    if (newScene.onEnter) {
      try {
        await newScene.onEnter(this.context);
      } catch (error) {
        console.error(`Erro ao entrar na cena ${sceneId}:`, error);
      }
    }

    this.emit('scene:changed', { 
      previousScene, 
      currentScene: sceneId, 
      scene: newScene 
    });
  }

  /**
   * Atualiza o estado do jogo
   */
  updateState(updates: Partial<GameState>): void {
    this.context.state = { ...this.context.state, ...updates };
    this.emit('state:updated', { updates, newState: this.context.state });
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
    this.emit('scene:registered', scene);
  }

  /**
   * Registra um novo comando
   */
  registerCommand(command: Command): void {
    this.inputProcessor.registerCommand(command);
    this.emit('command:registered', command);
  }

  /**
   * Remove uma cena
   */
  unregisterScene(sceneId: string): void {
    this.context.scenes.delete(sceneId);
    this.emit('scene:unregistered', sceneId);
  }

  /**
   * Remove um comando
   */
  unregisterCommand(commandId: string): void {
    this.inputProcessor.unregisterCommand(commandId);
    this.emit('command:unregistered', commandId);
  }

  /**
   * Processa input de teclado diretamente
   */
  async processKeyboardInput(key: string): Promise<void> {
    const inputEvent = this.inputProcessor.processKeyboardInput(key);
    await this.processInput(inputEvent);
  }

  /**
   * Registra comandos padrão do sistema
   */
  private registerDefaultCommands(): void {
    // Comando de ajuda
    this.registerCommand({
      id: 'help',
      name: 'Ajuda',
      description: 'Mostra lista de comandos disponíveis',
      combinations: [
        { buttons: [] } // Será acionado por comando de texto
      ],
      action: (context) => {
        const commands = Array.from(context.commands.values());
        const helpText = commands.map(cmd => 
          `${cmd.name}: ${cmd.description}`
        ).join('\n');
        
        this.emit('game:output', {
          type: 'text',
          content: `Comandos disponíveis:\n${helpText}`,
          timestamp: Date.now()
        });
      }
    });

    // Comando de status
    this.registerCommand({
      id: 'status',
      name: 'Status',
      description: 'Mostra informações do estado atual',
      combinations: [
        { buttons: [] }
      ],
      action: (context) => {
        const { state } = context;
        const statusText = [
          `Cena atual: ${state.currentScene}`,
          `Variáveis: ${Object.keys(state.variables).length}`,
          `Histórico: ${state.history.length} entradas`
        ].join('\n');

        this.emit('game:output', {
          type: 'text',
          content: statusText,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Sistema de eventos
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro em listener do evento ${event}:`, error);
        }
      });
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
      commandsCount: this.context.commands.size,
      pressedButtons: this.inputProcessor.getPressedButtons(),
      historyLength: this.context.state.history.length
    };
  }
}
