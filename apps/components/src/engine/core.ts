import { GameConfig, Scene, GameState, EngineOptions, Command, CommandType, Program, AppState, ProgramChoice } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class VaudioEngine {
  private appState: AppState;
  private basePath: string;
  private renderer: EngineOptions['renderer'];
  private inputHandler: EngineOptions['inputHandler'];
  private running: boolean = false;
  private messages: any = {};

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
      awaitingConfirmation: false
    };

    this.loadMessages();
  }

  private async loadMessages() {
    try {
      const configPath = path.join(this.basePath, 'program/config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      this.messages = config.messages || {};
    } catch (error) {
      // Fallback to empty object if config can't be loaded
      this.messages = { engine: { errors: {}, info: {} } };
    }
  }

  async initialize(): Promise<void> {
    await this.loadMessages();
    await this.inputHandler.initialize();
    await this.loadProgram('program/initial/menu.json');
  }

  async initializeWithProgram(programPath: string): Promise<void> {
    await this.loadMessages();
    await this.inputHandler.initialize();
    await this.loadProgram(programPath);
  }

  async start(): Promise<void> {
    this.running = true;
    
    while (this.running) {
      // Render current state
      if (this.appState.mode === 'program' && this.appState.currentProgram) {
        await this.renderer.renderProgram(this.appState.currentProgram, this.appState);
      } else if (this.appState.mode === 'game' && this.appState.currentGame && this.appState.gameState) {
        const scene = await this.loadGameScene(this.appState.gameState.currentScene);
        if (scene) {
          await this.renderer.renderGame(scene, this.appState.gameState);
        }
      }
      
      // Get user command
      const command = await this.inputHandler.getCommand();
      
      // Process command
      await this.processCommand(command);
    }
  }

  private async processCommand(command: Command): Promise<void> {
    if (this.appState.mode === 'program') {
      await this.processProgramCommand(command);
    } else if (this.appState.mode === 'game') {
      await this.processGameCommand(command);
    }
  }

  private async processProgramCommand(command: Command): Promise<void> {
    if (!this.appState.currentProgram) return;

    // New standardized command logic
    switch (command.type) {
      case '1':
      case '2':
      case '3':
      case '4':
        await this.handleOptionSelection(command.type);
        break;
        
      case '1+2': // Toggle mode (program -> program menu -> program)
        await this.handleModeToggle();
        break;
        
      case '1+4': // Switch to list 1
        this.appState.currentList = 'list1';
        this.appState.selectedOption = undefined;
        this.appState.awaitingConfirmation = false;
        break;
        
      case '3+2': // Switch to list 2  
        this.appState.currentList = 'list2';
        this.appState.selectedOption = undefined;
        this.appState.awaitingConfirmation = false;
        break;
        
      case '3+4': // Confirm selection
        if (this.appState.awaitingConfirmation && this.appState.selectedOption) {
          await this.executeSelection(this.appState.selectedOption);
        }
        break;
        
      default:
        const message = this.messages.commandNotRecognized || 'Comando não reconhecido.';
        await this.renderer.showMessage(message);
    }
  }

  private async handleOptionSelection(option: CommandType): Promise<void> {
    if (!this.appState.currentProgram) return;
    
    const choice = this.appState.currentProgram.choice[option];
    if (!choice) {
      const message = this.messages.optionNotAvailable || 'Opção não disponível.';
      await this.renderer.showMessage(message);
      return;
    }

    // Set selection and wait for confirmation
    this.appState.selectedOption = option;
    this.appState.awaitingConfirmation = true;
    
    // Show the selected option text and prompt for confirmation
    await this.renderer.showSelection(option, choice.label);
  }

  private async executeSelection(option: CommandType): Promise<void> {
    if (!this.appState.currentProgram) return;
    
    const choice = this.appState.currentProgram.choice[option];
    if (!choice) return;

    // Reset selection state
    this.appState.selectedOption = undefined;
    this.appState.awaitingConfirmation = false;

    if (choice.choice) {
      const subProgram: Program = {
        id: `${this.appState.currentProgram.id}_submenu`,
        description: choice.label,
        choice: choice.choice
      };
      
      this.appState.currentProgram = subProgram;
      return;
    }

    if (choice.goto) {
      await this.handleNavigation(choice.goto);
    }
  }

  private async handleModeToggle(): Promise<void> {
    // For programs, toggle to their respective menu
    if (this.appState.mode === 'program') {
      // Determine program type and load appropriate menu
      const programType = this.determineProgramType();
      if (programType === 'game') {
        await this.loadProgram('games/game-menu.json');
      } else {
        await this.loadProgram('program/program-menu.json');
      }
    }
  }

  private determineProgramType(): string {
    // Check current program path or context to determine type
    if (this.appState.currentProgram?.id?.includes('game')) {
      return 'game';
    }
    return 'program';
  }

  private async handleNavigation(goto: string): Promise<void> {
    switch (goto) {
      case '*': // Exit
        this.stop();
        break;
        
      case '-': // Back
        if (this.appState.programStack.length > 0) {
          const previousProgram = this.appState.programStack.pop()!;
          await this.loadProgram(previousProgram);
        }
        break;
        
      default:
        if (goto.startsWith('@/')) {
          // Load program
          const programPath = goto.substring(2); // Remove '@/'
          this.appState.programStack.push(`program/initial/menu.json`);
          await this.loadProgram(`program/${programPath}`);
        } else if (goto.startsWith('games/')) {
          // Load game
          await this.loadGame(goto);
        } else {
          const message = this.messages.navigationNotImplemented?.replace('{goto}', goto) || `Navegação não implementada: ${goto}`;
          await this.renderer.showMessage(message);
        }
        break;
    }
  }

  private async loadProgram(programPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, programPath);
      const programData = await fs.readFile(fullPath, 'utf-8');
      this.appState.currentProgram = JSON.parse(programData) as Program;
      this.appState.mode = 'program';
    } catch (error) {
      const message = this.messages.programLoadError?.replace('{path}', programPath) || `Erro ao carregar programa: ${programPath}`;
      await this.renderer.showMessage(message);
      console.error('Program load error:', error);
    }
  }

  private async loadGame(gamePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, gamePath, 'main.json');
      const gameData = await fs.readFile(fullPath, 'utf-8');
      const gameConfig = JSON.parse(gameData) as GameConfig;
      
      this.appState.currentGame = gameConfig;
      this.appState.mode = 'game';
      
      if (this.appState.gameState) {
        await this.loadGameScene(gameConfig.entry);
        this.appState.gameState.currentScene = gameConfig.entry;
      }
    } catch (error) {
      const message = this.messages.gameLoadError?.replace('{path}', gamePath) || `Erro ao carregar jogo: ${gamePath}`;
      await this.renderer.showMessage(message);
      console.error('Game load error:', error);
    }
  }

  private async loadGameScene(scenePath: string): Promise<Scene | null> {
    if (!this.appState.currentGame) return null;
    
    try {
      const gamePath = this.appState.programStack[this.appState.programStack.length - 1] || '';
      const gameDir = gamePath.replace('/main.json', '');
      const fullPath = path.join(this.basePath, gameDir, scenePath);
      const sceneData = await fs.readFile(fullPath, 'utf-8');
      const scene = JSON.parse(sceneData) as Scene;
      
      if (this.appState.gameState) {
        this.appState.gameState.currentScene = scene.id;
      }
      
      return scene;
    } catch (error) {
      console.error(`Erro ao carregar cena: ${scenePath}`, error);
      return null;
    }
  }

  private async processGameCommand(command: Command): Promise<void> {
    if (!this.appState.currentGame || !this.appState.gameState) return;

    const commandAction = this.appState.currentGame.config.command_map[command.type];
    
    switch (commandAction) {
      case 'choice':
        await this.handleGameChoice(command.type);
        break;
      case 'menu':
        // Return to program menu
        this.appState.mode = 'program';
        await this.loadProgram('program/initial/menu.json');
        break;
      case 'info':
        // Game info should be handled by JSON programs, not hardcoded
        break;
      case 'repeat':
        // Just re-render current scene
        break;
      default:
        const message = this.messages.commandNotRecognized || 'Comando não reconhecido.';
        await this.renderer.showMessage(message);
    }
  }

  private async handleGameChoice(commandType: CommandType): Promise<void> {
    const scene = await this.loadGameScene(this.appState.gameState!.currentScene);
    if (!scene?.choices?.[commandType]) {
      const message = this.messages.choiceNotAvailable || 'Escolha não disponível.';
      await this.renderer.showMessage(message);
      return;
    }

    const choices = scene.choices[commandType];
    if (choices && choices.length > 0) {
      const choice = choices[0];
      this.appState.gameState!.history.push(scene.id);
      await this.loadGameScene(choice.goto);
    }
  }

  stop(): void {
    this.running = false;
    this.inputHandler.cleanup();
  }
}

// Manter compatibilidade com nome antigo
export const GameEngine = VaudioEngine;
