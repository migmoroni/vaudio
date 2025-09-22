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
      }
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

    const choice = this.appState.currentProgram.choice[command.type];
    if (!choice) {
      const message = this.messages.engine?.errors?.optionNotAvailable || 'Opção não disponível.';
      await this.renderer.showMessage(message);
      return;
    }

    if (choice.choice) {
      const subProgram: Program = {
        id: `${this.appState.currentProgram.id}_submenu`,
        description: `${choice.label} - Escolha uma opção:`,
        choice: choice.choice
      };
      
      this.appState.currentProgram = subProgram;
      return;
    }

    if (choice.goto) {
      await this.handleNavigation(choice.goto);
    }
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
          const message = this.messages.engine?.errors?.navigationNotImplemented?.replace('{goto}', goto) || `Navegação não implementada: ${goto}`;
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
      const message = this.messages.engine?.errors?.programLoadError?.replace('{path}', programPath) || `Erro ao carregar programa: ${programPath}`;
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
      const message = this.messages.engine?.errors?.gameLoadError?.replace('{path}', gamePath) || `Erro ao carregar jogo: ${gamePath}`;
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
        await this.showGameInfo();
        break;
      case 'repeat':
        // Just re-render current scene
        break;
      default:
        const message = this.messages.engine?.errors?.commandNotRecognized || 'Comando não reconhecido.';
        await this.renderer.showMessage(message);
    }
  }

  private async handleGameChoice(commandType: CommandType): Promise<void> {
    const scene = await this.loadGameScene(this.appState.gameState!.currentScene);
    if (!scene?.choices?.[commandType]) {
      const message = this.messages.engine?.errors?.choiceNotAvailable || 'Escolha não disponível.';
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

  private async showGameInfo(): Promise<void> {
    const scene = await this.loadGameScene(this.appState.gameState!.currentScene);
    const messages = this.messages.engine?.info;
    
    const title = messages?.gameInfoTitle || '=== INFORMAÇÕES DO JOGO ===';
    const gameTitle = messages?.game?.replace('{title}', this.appState.currentGame?.title || '') || `Jogo: ${this.appState.currentGame?.title}`;
    const currentScene = messages?.currentScene?.replace('{scene}', scene?.title || '') || `Cena atual: ${scene?.title}`;
    
    const inventoryItems = this.appState.gameState!.inventory.length > 0 
      ? this.appState.gameState!.inventory.join(', ') 
      : (messages?.emptyInventory || 'vazio');
    const inventory = messages?.inventory?.replace('{items}', inventoryItems) || `Inventário: ${inventoryItems}`;
    
    const availableCommands = messages?.availableCommands || 'Comandos disponíveis:';
    const commandsList = messages?.commandsList || [
      '1-4: Escolhas diretas',
      'q (1+2): Voltar ao menu principal',
      'w (1+4): Informações', 
      'r (3+4): Repetir cena'
    ];
    
    const infoText = `
${title}
${gameTitle}
${currentScene}
${inventory}

${availableCommands}
${commandsList.join('\n')}
    `;
    await this.renderer.showMessage(infoText);
  }

  stop(): void {
    this.running = false;
    this.inputHandler.cleanup();
  }
}

// Manter compatibilidade com nome antigo
export const GameEngine = VaudioEngine;
