import { Program, AppState, CommandType, ChoiceValue, ProgramChoice } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ProgramHandler {
  private basePath: string;
  private messages: any;

  constructor(basePath: string, messages: any) {
    this.basePath = basePath;
    this.messages = messages;
  }

  async loadProgram(programPath: string, appState: AppState): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, programPath);
      const programData = await fs.readFile(fullPath, 'utf-8');
      appState.currentProgram = JSON.parse(programData) as Program;
      appState.mode = 'program';
    } catch (error) {
      const message = this.messages.programLoadError?.replace('{path}', programPath) || `Erro ao carregar programa: ${programPath}`;
      throw new Error(message);
    }
  }

  validateChoice(program: Program, option: CommandType): boolean {
    return !!program.choice[option];
  }

  getChoice(program: Program, option: CommandType): ChoiceValue | undefined {
    return program.choice[option];
  }

  // Get current choice for a command option, considering array navigation
  getCurrentChoice(program: Program, option: CommandType, currentIndex: number = 0): ProgramChoice | undefined {
    const choice = this.getChoice(program, option);
    if (!choice) return undefined;

    // Format 1: Single choice object
    if (!Array.isArray(choice)) {
      return choice;
    }

    // Format 2: Array of choices - return choice at current index
    if (choice.length > 0 && currentIndex >= 0 && currentIndex < choice.length) {
      return choice[currentIndex];
    }

    return undefined;
  }

  // Check if a choice is an array (Format 2)
  isChoiceArray(program: Program, option: CommandType): boolean {
    const choice = this.getChoice(program, option);
    return Array.isArray(choice);
  }

  // Get the length of a choice array (0 for Format 1)
  getChoiceArrayLength(program: Program, option: CommandType): number {
    const choice = this.getChoice(program, option);
    return Array.isArray(choice) ? choice.length : 0;
  }

  createSubProgram(program: Program, choice: ProgramChoice): Program {
    return {
      id: `${program.id}_submenu`,
      description: choice.label,
      choice: (choice.choice || {}) as Record<CommandType, ChoiceValue>
    };
  }

  async handleNavigation(goto: string, appState: AppState): Promise<void> {
    switch (goto) {
      case '*': // Exit
        throw new Error('EXIT_REQUESTED');
        
      case '-': // Back
        if (appState.programStack.length > 0) {
          const previousProgram = appState.programStack.pop()!;
          await this.loadProgram(previousProgram, appState);
        }
        break;
        
      default:
        if (goto.startsWith('@/')) {
          // Load program
          const programPath = goto.substring(2); // Remove '@/'
          appState.programStack.push(`program/initial/menu.json`);
          await this.loadProgram(`program/${programPath}`, appState);
        } else if (goto.startsWith('games/')) {
          // This will be handled by GameHandler
          throw new Error(`LOAD_GAME:${goto}`);
        } else {
          const message = this.messages.navigationNotImplemented?.replace('{goto}', goto) || `Navegação não implementada: ${goto}`;
          throw new Error(message);
        }
        break;
    }
  }

  async loadMainConfig(configPath: string): Promise<any> {
    try {
      const fullPath = path.join(this.basePath, configPath);
      const configData = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Erro ao carregar configuração principal: ${configPath}`);
    }
  }

  async loadExtraContent(mainConfigPath: string, extraPath: string): Promise<any> {
    try {
      // Get the directory of the main config
      const configDir = path.dirname(path.join(this.basePath, mainConfigPath));
      const fullExtraPath = path.join(configDir, extraPath);
      const extraData = await fs.readFile(fullExtraPath, 'utf-8');
      return JSON.parse(extraData);
    } catch (error) {
      throw new Error(`Erro ao carregar conteúdo extra: ${extraPath}`);
    }
  }
}