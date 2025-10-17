import { Program, AppState, CommandType } from '../types';
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

  getChoice(program: Program, option: CommandType) {
    return program.choice[option];
  }

  createSubProgram(program: Program, choice: any): Program {
    return {
      id: `${program.id}_submenu`,
      description: choice.label,
      choice: choice.choice
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
}