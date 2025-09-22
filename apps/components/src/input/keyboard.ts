import { InputHandler, Command, CommandType, InputEvent } from '../types';
import * as readline from 'readline';

export class KeyboardInputHandler implements InputHandler {
  private rl: readline.Interface | null = null;
  private commandQueue: Command[] = [];

  async initialize(): Promise<void> {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Set up raw mode to capture individual key presses
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    
    process.stdin.on('data', this.handleKeyPress.bind(this));
  }

  private handleKeyPress(buffer: Buffer): void {
    const key = buffer.toString();
    
    // Handle Ctrl+C for graceful exit
    if (key === '\u0003') {
      this.cleanup();
      process.exit(0);
    }

    const command = this.translateKeyToCommand(key);
    if (command) {
      this.commandQueue.push(command);
    }
  }

  private translateKeyToCommand(key: string): Command | null {
    const timestamp = Date.now();
    let commandType: CommandType | null = null;

    // Map keys to command types
    switch (key) {
      case '1':
        commandType = '1';
        break;
      case '2':
        commandType = '2';
        break;
      case '3':
        commandType = '3';
        break;
      case '4':
        commandType = '4';
        break;
      case 'q': // Simulate 1+2
        commandType = '1+2';
        break;
      case 'w': // Simulate 1+4
        commandType = '1+4';
        break;
      case 'e': // Simulate 2+3
        commandType = '3+2';
        break;
      case 'r': // Simulate 3+4
        commandType = '3+4';
        break;
      default:
        return null;
    }

    return {
      type: commandType,
      timestamp,
      raw: key
    };
  }

  async getCommand(): Promise<Command> {
    return new Promise((resolve) => {
      const checkQueue = () => {
        if (this.commandQueue.length > 0) {
          const command = this.commandQueue.shift()!;
          resolve(command);
        } else {
          setTimeout(checkQueue, 50);
        }
      };
      checkQueue();
    });
  }

  cleanup(): void {
    if (this.rl) {
      this.rl.close();
    }
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.removeAllListeners('data');
  }
}
