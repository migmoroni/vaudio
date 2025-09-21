import { Renderer, Scene, GameState, Program, AppState } from '../types';

export class ConsoleRenderer implements Renderer {
  async renderProgram(program: Program, state: AppState): Promise<void> {
    this.clear();
    
    // Render program description
    console.log(`=== ${program.id.toUpperCase()} ===`);
    console.log();
    console.log(program.description);
    console.log();
    
    // Render choices
    if (program.choice) {
      console.log('Opções disponíveis:');
      
      Object.entries(program.choice).forEach(([commandType, choice]) => {
        if (choice) {
          const keyDisplay = this.getKeyDisplay(commandType);
          console.log(`${keyDisplay}: ${choice.label}`);
        }
      });
      
      console.log();
      console.log('Navegação:');
      console.log('Use as teclas 1-4 ou combinações (q,w,e,r) para navegar');
      console.log('Ctrl+C: Sair');
    }
    
    console.log();
    console.log('> Aguardando comando...');
  }

  async renderGame(scene: Scene, state: GameState): Promise<void> {
    this.clear();
    
    // Render scene title
    console.log(`=== ${scene.title} ===`);
    console.log();
    
    // Render scene description
    console.log(scene.description);
    console.log();
    
    // Render choices if available
    if (scene.choices) {
      console.log('Escolhas disponíveis:');
      
      Object.entries(scene.choices).forEach(([commandType, choices]) => {
        if (choices && choices.length > 0) {
          choices.forEach((choice, index) => {
            const keyDisplay = this.getKeyDisplay(commandType);
            console.log(`${keyDisplay}: ${choice.text}`);
          });
        }
      });
      
      console.log();
      console.log('Comandos especiais:');
      console.log('q (1+2): Menu');
      console.log('w (1+4): Informações');
      console.log('e (2+3): [Reservado]');
      console.log('r (3+4): Repetir');
      console.log('Ctrl+C: Sair');
    }
    
    console.log();
    console.log('> Aguardando comando...');
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
    console.log('Pressione qualquer tecla para continuar...');
    return new Promise((resolve) => {
      const handler = () => {
        process.stdin.removeListener('data', handler);
        resolve();
      };
      process.stdin.once('data', handler);
    });
  }
}
