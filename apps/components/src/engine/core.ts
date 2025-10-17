import { GameConfig, Scene, GameState, EngineOptions, Command, CommandType, Program, AppState, ProgramChoice } from '../types';
import { ProgramHandler } from './program-handler';
import { GameHandler } from './game-handler';
import { CommandProcessor } from './command-processor';
import { ConfigManager } from './config-manager';

export class VaudioEngine {
  private appState: AppState;
  private basePath: string;
  private renderer: EngineOptions['renderer'];
  private inputHandler: EngineOptions['inputHandler'];
  private running: boolean = false;
  
  // Modular components
  private configManager: ConfigManager;
  private programHandler: ProgramHandler;
  private gameHandler: GameHandler;
  private commandProcessor: CommandProcessor;

  constructor(options: EngineOptions) {
    this.basePath = options.basePath;
    this.renderer = options.renderer;
    this.inputHandler = options.inputHandler;
    
    this.appState = {
      mode: 'program',
      programStack: [],
      gameState: {
        currentScene: '',
        inventory: [],
        variables: {},
        history: []
      },
      // Initialize new selection system
      selectedOption: undefined,
      currentList: 'main',
      awaitingConfirmation: false,
      extraFrameNumber: undefined
    };

    // Initialize modular components
    this.configManager = new ConfigManager(this.basePath);
    this.programHandler = new ProgramHandler(this.basePath, {});
    this.gameHandler = new GameHandler(this.basePath, {});
    this.commandProcessor = new CommandProcessor(
      this.programHandler,
      this.gameHandler,
      {},
      this.renderer
    );

    this.loadMessages();
  }

  private async loadMessages() {
    const messages = await this.configManager.loadMessages();
    // Update handlers with loaded messages
    this.programHandler = new ProgramHandler(this.basePath, messages);
    this.gameHandler = new GameHandler(this.basePath, messages);
    this.commandProcessor = new CommandProcessor(
      this.programHandler,
      this.gameHandler,
      messages,
      this.renderer
    );
  }

  async initialize(): Promise<void> {
    await this.loadMessages();
    await this.inputHandler.initialize();
    await this.programHandler.loadProgram('program/initial/menu.json', this.appState);
  }

  async initializeWithProgram(programPath: string): Promise<void> {
    await this.loadMessages();
    await this.inputHandler.initialize();
    await this.programHandler.loadProgram(programPath, this.appState);
  }

  async start(): Promise<void> {
    this.running = true;
    let shouldRender = true;
    
    while (this.running) {
      // Only render when needed, not when awaiting confirmation
      if (shouldRender && !this.appState.awaitingConfirmation) {
        if (this.appState.mode === 'program' && this.appState.currentProgram) {
          await this.renderer.renderProgram(this.appState.currentProgram, this.appState);
        } else if (this.appState.mode === 'game' && this.appState.currentGame && this.appState.gameState) {
          const scene = await this.gameHandler.loadGameScene(this.appState.gameState.currentScene, this.appState);
          if (scene) {
            await this.renderer.renderGame(scene, this.appState.gameState);
          }
        }
        shouldRender = false; // Don't render again until state changes
      }
      
      // Wait for user command
      const command = await this.inputHandler.getCommand();
      
      // Process command
      try {
        await this.commandProcessor.processCommand(command, this.appState);
      } catch (error) {
        if (error instanceof Error && error.message === 'EXIT_REQUESTED') {
          this.stop();
          break;
        }
      }
      
      // Mark for re-render after processing command
      shouldRender = true;
    }
  }

  stop(): void {
    this.running = false;
    this.inputHandler.cleanup();
  }
}

// Manter compatibilidade com nome antigo
export const GameEngine = VaudioEngine;
