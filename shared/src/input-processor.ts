import { 
  InputEvent, 
  ButtonType, 
  InputCombination, 
  Command, 
  GameContext, 
  InputDevice, 
  ButtonState 
} from './types';

export class InputProcessor {
  private pressedButtons: Set<ButtonType> = new Set();
  private lastInputTime: number = 0;
  private pendingCombination: ButtonType[] = [];
  private combinationTimeout: NodeJS.Timeout | null = null;
  
  constructor(
    private gameContext: GameContext,
    private maxCombinationInterval: number = 500 // 500ms para combinações
  ) {}

  /**
   * Processa um evento de input e determina se forma uma combinação válida
   */
  processInput(event: InputEvent): void {
    const now = Date.now();
    
    // Atualiza estado dos botões pressionados
    event.buttonStates.forEach((buttonState: ButtonState) => {
      if (buttonState.pressed) {
        this.pressedButtons.add(buttonState.button);
        this.pendingCombination.push(buttonState.button);
      } else {
        this.pressedButtons.delete(buttonState.button);
      }
    });

    // Verifica se temos combinações válidas
    this.checkForValidCombinations(now);
    
    this.lastInputTime = now;
  }

  /**
   * Processa input de teclado e mapeia para botões virtuais
   */
  processKeyboardInput(key: string): InputEvent {
    const buttonMapping = this.getKeyboardButtonMapping();
    const mappedButton = buttonMapping.get(key.toLowerCase());
    
    if (!mappedButton) {
      // Retorna evento vazio se a tecla não está mapeada
      return {
        device: InputDevice.KEYBOARD,
        buttonStates: [],
        timestamp: Date.now(),
        raw: { key }
      };
    }

    return {
      device: InputDevice.KEYBOARD,
      buttonStates: [{
        button: mappedButton,
        pressed: true,
        timestamp: Date.now()
      }],
      timestamp: Date.now(),
      raw: { key }
    };
  }

  /**
   * Mapeia teclas do teclado para botões virtuais
   */
  private getKeyboardButtonMapping(): Map<string, ButtonType> {
    return new Map([
      // Teclas direcionais
      ['w', ButtonType.TOP_LEFT],
      ['e', ButtonType.TOP_RIGHT],
      ['s', ButtonType.BOTTOM_LEFT],
      ['d', ButtonType.BOTTOM_RIGHT],
      
      // Teclas numéricas
      ['1', ButtonType.TOP_LEFT],
      ['2', ButtonType.TOP_RIGHT],
      ['3', ButtonType.BOTTOM_LEFT],
      ['4', ButtonType.BOTTOM_RIGHT],
      
      // Setas do teclado
      ['arrowup', ButtonType.TOP_LEFT],
      ['arrowright', ButtonType.TOP_RIGHT],
      ['arrowdown', ButtonType.BOTTOM_LEFT],
      ['arrowleft', ButtonType.BOTTOM_RIGHT],
    ]);
  }

  /**
   * Verifica se os botões pressionados formam uma combinação válida
   */
  private checkForValidCombinations(currentTime: number): void {
    const commands = Array.from(this.gameContext.commands.values());
    
    for (const command of commands) {
      for (const combination of command.combinations) {
        if (this.matchesCombination(combination, currentTime)) {
          this.executeCombination(command);
          this.clearPendingCombination();
          return;
        }
      }
    }

    // Limpa combinação pendente se passou muito tempo
    if (currentTime - this.lastInputTime > this.maxCombinationInterval) {
      this.clearPendingCombination();
    }
  }

  /**
   * Verifica se a combinação atual corresponde a uma combinação válida
   */
  private matchesCombination(combination: InputCombination, currentTime: number): boolean {
    // Verifica se todos os botões da combinação foram pressionados
    const hasAllButtons = combination.buttons.every((button: ButtonType) => 
      this.pendingCombination.includes(button)
    );

    if (!hasAllButtons) return false;

    // Verifica intervalo de tempo entre pressionamentos
    const maxInterval = combination.maxInterval || this.maxCombinationInterval;
    const timeSinceStart = currentTime - this.lastInputTime;
    
    return timeSinceStart <= maxInterval;
  }

  /**
   * Executa uma combinação válida
   */
  private executeCombination(command: Command): void {
    try {
      command.action(this.gameContext);
      console.log(`Comando executado: ${command.name}`);
    } catch (error) {
      console.error(`Erro ao executar comando ${command.name}:`, error);
    }
  }

  /**
   * Limpa a combinação pendente
   */
  private clearPendingCombination(): void {
    this.pendingCombination = [];
    this.pressedButtons.clear();
    
    if (this.combinationTimeout) {
      clearTimeout(this.combinationTimeout);
      this.combinationTimeout = null;
    }
  }

  /**
   * Registra um novo comando
   */
  registerCommand(command: Command): void {
    this.gameContext.commands.set(command.id, command);
  }

  /**
   * Remove um comando
   */
  unregisterCommand(commandId: string): void {
    this.gameContext.commands.delete(commandId);
  }

  /**
   * Lista todos os comandos registrados
   */
  getRegisteredCommands(): Command[] {
    return Array.from(this.gameContext.commands.values());
  }

  /**
   * Obtém o estado atual dos botões pressionados
   */
  getPressedButtons(): ButtonType[] {
    return Array.from(this.pressedButtons);
  }
}
