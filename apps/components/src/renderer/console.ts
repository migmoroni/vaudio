import { Renderer, Scene, GameState, Program, AppState, CommandType } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ConsoleRenderer implements Renderer {
  private messages: any = {};

  constructor() {
    this.loadMessages();
  }

  private loadMessages() {
    try {
      const configPath = path.resolve('./program/config.json');
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData);
      this.messages = config.messages || {};
    } catch (error) {
      // Fallback to empty object if config can't be loaded
      this.messages = { ui: {}, engine: { errors: {}, info: {} } };
    }
  }
  async renderProgram(program: Program, state: AppState): Promise<void> {
    this.clear();
    
    console.log(`=== ${program.id.toUpperCase()} ===`);
    console.log();
    console.log(program.description);
    console.log();
    
    if (program.choice) {
      console.log(this.messages.ui?.availableChoices || 'Opções disponíveis:');
      
      Object.entries(program.choice).forEach(([commandType, choice]) => {
        if (choice) {
          const keyDisplay = this.getKeyDisplay(commandType);
          console.log(`${keyDisplay}: ${choice.label}`);
        }
      });
    }
    
    console.log();
    console.log(this.messages.ui?.waiting || '> Aguardando comando...');
  }

  async renderGame(scene: Scene, state: GameState): Promise<void> {
    this.clear();
    
    console.log(`=== ${scene.title} ===`);
    console.log();
    console.log(scene.description);
    console.log();
    
    if (scene.choices) {
      console.log(this.messages.ui?.availableChoices || 'Escolhas disponíveis:');
      
      Object.entries(scene.choices).forEach(([commandType, choices]) => {
        if (choices && choices.length > 0) {
          choices.forEach((choice, index) => {
            const keyDisplay = this.getKeyDisplay(commandType);
            console.log(`${keyDisplay}: ${choice.text}`);
          });
        }
      });
    }
    
    console.log();
    console.log(this.messages.ui?.waiting || '> Aguardando comando...');
  }

  private getKeyDisplay(commandType: string): string {
    switch (commandType) {
      case '1': return '1';
      case '2': return '2';
      case '3': return '3';
      case '4': return '4';
      case '1+2': return 'q';
      case '1+4': return 'w';
      case '3+2': return 'e';
      case '3+4': return 'r';
      default: return commandType;
    }
  }

  clear(): void {
    console.clear();
  }

  async showMessage(message: string): Promise<void> {
    console.log(`\n${message}\n`);
    await this.waitForKeyPress();
  }

  async showSelection(option: CommandType, text: string): Promise<void> {
    this.clear();
    console.log('=== SELEÇÃO ===');
    console.log();
    console.log(`Opção selecionada: ${this.getKeyDisplay(option)}`);
    console.log(`${text}`);
    console.log();
    console.log('💡 Pressione (3+4 / r) para CONFIRMAR a seleção');
    console.log('   Ou escolha outra opção (1-4)');
    console.log();
    console.log('> Aguardando confirmação...');
  }

  private async waitForKeyPress(): Promise<void> {
    console.log(this.messages.ui?.continuePrompt || 'Pressione qualquer tecla para continuar...');
    return new Promise((resolve) => {
      const handler = () => {
        process.stdin.removeListener('data', handler);
        resolve();
      };
      process.stdin.once('data', handler);
    });
  }
}
