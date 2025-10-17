import { AppState, CommandType, Command } from '../types';
import { ProgramHandler } from './program-handler';
import { GameHandler } from './game-handler';

export class CommandProcessor {
  private programHandler: ProgramHandler;
  private gameHandler: GameHandler;
  private messages: any;
  private renderer: any;

  constructor(programHandler: ProgramHandler, gameHandler: GameHandler, messages: any, renderer: any) {
    this.programHandler = programHandler;
    this.gameHandler = gameHandler;
    this.messages = messages;
    this.renderer = renderer;
  }

  async processCommand(command: Command, appState: AppState): Promise<void> {
    try {
      if (appState.mode === 'program') {
        await this.processProgramCommand(command, appState);
      } else if (appState.mode === 'game') {
        await this.processGameCommand(command, appState);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'EXIT_REQUESTED') {
          throw error;
        } else if (error.message.startsWith('LOAD_GAME:')) {
          const gamePath = error.message.substring(10);
          await this.gameHandler.loadGame(gamePath, appState);
        } else if (error.message === 'RETURN_TO_MENU') {
          appState.mode = 'program';
          await this.programHandler.loadProgram('program/initial/menu.json', appState);
        } else {
          await this.renderer.showMessage(error.message);
        }
      }
    }
  }

  private async processProgramCommand(command: Command, appState: AppState): Promise<void> {
    if (!appState.currentProgram) return;

    // New standardized command logic
    switch (command.type) {
      case '1':
      case '2':
      case '3':
      case '4':
        await this.handleOptionSelection(command.type, appState);
        break;
        
      case '1+2': // Toggle mode (program -> program menu -> program)
        await this.handleModeToggle(appState);
        break;
        
      case '1+4': // Access extra frames
        await this.handleExtraFrames(appState);
        break;
        
      case '3+2': // Return command (when available in choices)
        await this.handleReturnCommand(appState);
        break;
        
      case '3+4': // Confirm selection
        if (appState.awaitingConfirmation && appState.selectedOption) {
          await this.executeSelection(appState.selectedOption, appState);
        }
        break;
        
      default:
        const message = this.messages.commandNotRecognized || 'Comando não reconhecido.';
        await this.renderer.showMessage(message);
    }
  }

  private async processGameCommand(command: Command, appState: AppState): Promise<void> {
    await this.gameHandler.processGameCommand(command.type, appState);
  }

  private async handleOptionSelection(option: CommandType, appState: AppState): Promise<void> {
    if (!appState.currentProgram) return;
    
    if (!this.programHandler.validateChoice(appState.currentProgram, option)) {
      const message = this.messages.optionNotAvailable || 'Opção não disponível.';
      await this.renderer.showMessage(message);
      return;
    }

    const choice = this.programHandler.getChoice(appState.currentProgram, option);

    // Set selection and wait for confirmation
    appState.selectedOption = option;
    appState.awaitingConfirmation = true;
    
    // Show the selected option text and prompt for confirmation
    await this.renderer.showSelection(option, choice.label);
  }

  private async executeSelection(option: CommandType, appState: AppState): Promise<void> {
    if (!appState.currentProgram) return;
    
    const choice = this.programHandler.getChoice(appState.currentProgram, option);
    if (!choice) return;

    // Reset selection state
    appState.selectedOption = undefined;
    appState.awaitingConfirmation = false;

    if (choice.choice) {
      const subProgram = this.programHandler.createSubProgram(appState.currentProgram, choice);
      appState.currentProgram = subProgram;
      return;
    }

    if (choice.goto) {
      await this.programHandler.handleNavigation(choice.goto, appState);
    }
  }

  private async handleModeToggle(appState: AppState): Promise<void> {
    // For programs, toggle to their respective menu
    if (appState.mode === 'program') {
      // Determine program type and load appropriate menu
      const programType = this.determineProgramType(appState);
      if (programType === 'game') {
        await this.programHandler.loadProgram('games/game-menu.json', appState);
      } else {
        await this.programHandler.loadProgram('program/program-menu.json', appState);
      }
    }
  }

  private determineProgramType(appState: AppState): string {
    // Check current program path or context to determine type
    if (appState.currentProgram?.id?.includes('game')) {
      return 'game';
    }
    return 'program';
  }

  private async handleExtraFrames(appState: AppState): Promise<void> {
    if (appState.currentList === 'extra') {
      // If already in extra mode, go back to main
      appState.currentList = 'main';
      appState.extraFrameNumber = undefined;
    } else {
      // Switch to extra mode
      appState.currentList = 'extra';
      // Load extra frame from current program's configuration
      if (appState.currentProgram?.extra) {
        appState.extraFrameNumber = appState.currentProgram.extra;
        await this.loadExtraFrame(appState);
      }
    }
    appState.selectedOption = undefined;
    appState.awaitingConfirmation = false;
  }

  private async handleReturnCommand(appState: AppState): Promise<void> {
    if (!appState.currentProgram) return;
    
    // Check if return command is available in current choices
    const returnChoice = appState.currentProgram.choice['3+2'];
    if (returnChoice) {
      // Execute the return navigation
      if (returnChoice.goto) {
        await this.programHandler.handleNavigation(returnChoice.goto, appState);
      }
    } else {
      const message = this.messages.returnNotAvailable || 'Comando de retorno não disponível neste contexto.';
      await this.renderer.showMessage(message);
    }
  }

  private async loadExtraFrame(appState: AppState): Promise<void> {
    if (!appState.extraFrameNumber) return;
    
    try {
      // Load the main.json from current program's base directory to get extra mappings
      const mainConfigPath = await this.findMainConfig(appState);
      if (mainConfigPath) {
        const mainData = await this.programHandler.loadMainConfig(mainConfigPath);
        const extraPath = mainData.extra?.[appState.extraFrameNumber];
        
        if (extraPath) {
          // Load the extra frame content
          const extraContent = await this.programHandler.loadExtraContent(mainConfigPath, extraPath);
          // Here you would render the extra content or handle it appropriately
          await this.renderer.showMessage(`Extra frame ${appState.extraFrameNumber}: ${extraContent.description || 'Conteúdo extra'}`);
        }
      }
    } catch (error) {
      const message = this.messages.extraFrameError || 'Erro ao carregar quadro extra.';
      await this.renderer.showMessage(message);
    }
  }

  private async findMainConfig(appState: AppState): Promise<string | null> {
    // Logic to find the main.json for the current program/game context
    // This would depend on how you want to structure the program directories
    // For now, assuming it's in the same directory as the current program
    if (appState.currentGame) {
      return `games/${appState.currentGame.id}/main.json`;
    }
    return null;
  }
}