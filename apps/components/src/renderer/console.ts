import { Renderer, Scene, GameState, Program, AppState } from '../types';
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
      
      console.log();
      console.log(this.messages.ui?.navigation || 'Navegação:');
      console.log(this.messages.ui?.controls || 'Use as teclas 1-4 ou combinações (q,w,e,r) para navegar');
      console.log(this.messages.ui?.exit || 'Ctrl+C: Sair');
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
      
      console.log();
      console.log(this.messages.ui?.specialCommands || 'Comandos especiais:');
      console.log(this.messages.ui?.gameMenu || 'q (1+2): Menu');
      console.log(this.messages.ui?.gameInfo || 'w (1+4): Informações');
      console.log(this.messages.ui?.gameReserved || 'e (2+3): [Reservado]');
      console.log(this.messages.ui?.gameRepeat || 'r (3+4): Repetir');
      console.log(this.messages.ui?.exit || 'Ctrl+C: Sair');
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
      case '2+3': return 'e';
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
