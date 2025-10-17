import { GameConfig, Scene, GameState, AppState, CommandType } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class GameHandler {
  private basePath: string;
  private messages: any;

  constructor(basePath: string, messages: any) {
    this.basePath = basePath;
    this.messages = messages;
  }

  async loadGame(gamePath: string, appState: AppState): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, gamePath, 'main.json');
      const gameData = await fs.readFile(fullPath, 'utf-8');
      const gameConfig = JSON.parse(gameData) as GameConfig;
      
      appState.currentGame = gameConfig;
      appState.mode = 'game';
      
      if (appState.gameState) {
        await this.loadGameScene(gameConfig.entry, appState);
        appState.gameState.currentScene = gameConfig.entry;
      }
    } catch (error) {
      const message = this.messages.gameLoadError?.replace('{path}', gamePath) || `Erro ao carregar jogo: ${gamePath}`;
      throw new Error(message);
    }
  }

  async loadGameScene(scenePath: string, appState: AppState): Promise<Scene | null> {
    if (!appState.currentGame) return null;
    
    try {
      const gamePath = appState.programStack[appState.programStack.length - 1] || '';
      const gameDir = gamePath.replace('/main.json', '');
      const fullPath = path.join(this.basePath, gameDir, scenePath);
      const sceneData = await fs.readFile(fullPath, 'utf-8');
      const scene = JSON.parse(sceneData) as Scene;
      
      if (appState.gameState) {
        appState.gameState.currentScene = scene.id;
      }
      
      return scene;
    } catch (error) {
      console.error(`Erro ao carregar cena: ${scenePath}`, error);
      return null;
    }
  }

  async handleGameChoice(commandType: CommandType, appState: AppState): Promise<void> {
    const scene = await this.loadGameScene(appState.gameState!.currentScene, appState);
    if (!scene?.choices?.[commandType]) {
      const message = this.messages.choiceNotAvailable || 'Escolha não disponível.';
      throw new Error(message);
    }

    const choices = scene.choices[commandType];
    if (choices && choices.length > 0) {
      const choice = choices[0];
      appState.gameState!.history.push(scene.id);
      await this.loadGameScene(choice.goto, appState);
    }
  }

  async processGameCommand(command: CommandType, appState: AppState): Promise<void> {
    if (!appState.currentGame || !appState.gameState) return;

    const commandAction = appState.currentGame.config.command_map?.[command];
    
    switch (commandAction) {
      case 'choice':
        await this.handleGameChoice(command, appState);
        break;
      case 'menu':
        // Return to program menu - will be handled by main engine
        throw new Error('RETURN_TO_MENU');
      case 'info':
        // Game info should be handled by JSON programs, not hardcoded
        break;
      case 'repeat':
        // Just re-render current scene
        break;
      default:
        const message = this.messages.commandNotRecognized || 'Comando não reconhecido.';
        throw new Error(message);
    }
  }
}