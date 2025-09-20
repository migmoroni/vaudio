import { InputProcessor, CommandEvent, GameCommand } from '../input';

/**
 * Contextos de jogo onde comandos são interpretados
 */
export enum GameContext {
  MENU = 'menu',
  GAME = 'game', 
  SHOP = 'shop',
  EDITOR = 'editor',
  INVENTORY = 'inventory'
}

/**
 * Definições de comandos por contexto (simulando JSON)
 */
export const COMMAND_DEFINITIONS = {
  [GameContext.MENU]: {
    "1": "navigate_up",
    "2": "select",
    "3": "navigate_down", 
    "4": "back",
    "1+2": "quick_select",
    "1+4": "help",
    "3+2": "context_menu",
    "3+4": "exit"
  },
  [GameContext.GAME]: {
    "1": "move_north",
    "2": "move_east",
    "3": "move_south",
    "4": "move_west", 
    "1+2": "attack_northeast",
    "1+4": "attack_northwest",
    "3+2": "attack_southeast", 
    "3+4": "attack_southwest"
  },
  [GameContext.SHOP]: {
    "1": "scroll_up",
    "2": "buy_item",
    "3": "scroll_down",
    "4": "exit_shop",
    "1+2": "quick_buy",
    "1+4": "compare_item",
    "3+2": "sell_item",
    "3+4": "bulk_sell"
  },
  [GameContext.EDITOR]: {
    "1": "move_cursor_up",
    "2": "place_tile",
    "3": "move_cursor_down", 
    "4": "delete_tile",
    "1+2": "copy_tile",
    "1+4": "undo",
    "3+2": "paste_tile",
    "3+4": "redo"
  },
  [GameContext.INVENTORY]: {
    "1": "select_previous",
    "2": "use_item",
    "3": "select_next",
    "4": "close_inventory",
    "1+2": "quick_use",
    "1+4": "sort_items", 
    "3+2": "drop_item",
    "3+4": "show_details"
  }
};

/**
 * Sistema de interpretação de comandos baseado em contexto
 */
export class GameCommandInterpreter {
  private currentContext: GameContext = GameContext.MENU;
  private inputProcessor: InputProcessor;
  
  // Callbacks para diferentes ações
  private actionHandlers: Map<string, () => void> = new Map();

  constructor() {
    // Inicializa processador de input
    this.inputProcessor = new InputProcessor({
      enableCombinations: true,
      combinationTimeout: 500,
      debugMode: true
    });

    // Registra callback para comandos
    this.inputProcessor.onCommand((commandEvent: CommandEvent) => {
      this.handleCommand(commandEvent.command);
    });

    this.setupDefaultHandlers();
  }

  /**
   * Define contexto atual do jogo
   */
  setContext(context: GameContext): void {
    console.log(`[GameCommandInterpreter] Mudando contexto: ${this.currentContext} → ${context}`);
    this.currentContext = context;
  }

  /**
   * Obtém contexto atual
   */
  getContext(): GameContext {
    return this.currentContext;
  }

  /**
   * Interpreta comando baseado no contexto atual
   */
  private handleCommand(command: GameCommand): void {
    const contextDefinitions = COMMAND_DEFINITIONS[this.currentContext];
    const action = contextDefinitions[command];

    if (action) {
      console.log(`[GameCommandInterpreter] Executando: ${action} (${command} em ${this.currentContext})`);
      this.executeAction(action);
    } else {
      console.warn(`[GameCommandInterpreter] Comando ${command} não definido para contexto ${this.currentContext}`);
    }
  }

  /**
   * Executa ação específica
   */
  private executeAction(action: string): void {
    const handler = this.actionHandlers.get(action);
    if (handler) {
      handler();
    } else {
      console.log(`[GameCommandInterpreter] Ação executada: ${action}`);
    }
  }

  /**
   * Registra handler para ação específica
   */
  registerActionHandler(action: string, handler: () => void): void {
    this.actionHandlers.set(action, handler);
  }

  /**
   * Remove handler de ação
   */
  unregisterActionHandler(action: string): void {
    this.actionHandlers.delete(action);
  }

  /**
   * Setup de handlers padrão para demonstração
   */
  private setupDefaultHandlers(): void {
    // Ações de menu
    this.registerActionHandler('navigate_up', () => console.log('🔼 Navegando para cima no menu'));
    this.registerActionHandler('navigate_down', () => console.log('🔽 Navegando para baixo no menu'));
    this.registerActionHandler('select', () => console.log('✅ Item selecionado'));
    this.registerActionHandler('back', () => console.log('⬅️ Voltando'));
    this.registerActionHandler('quick_select', () => console.log('⚡ Seleção rápida'));
    this.registerActionHandler('exit', () => console.log('🚪 Saindo'));

    // Ações de gameplay
    this.registerActionHandler('move_north', () => console.log('⬆️ Movendo para norte'));
    this.registerActionHandler('move_east', () => console.log('➡️ Movendo para leste'));
    this.registerActionHandler('move_south', () => console.log('⬇️ Movendo para sul'));
    this.registerActionHandler('move_west', () => console.log('⬅️ Movendo para oeste'));
    this.registerActionHandler('attack_northeast', () => console.log('⚔️ Atacando nordeste'));
    this.registerActionHandler('attack_southwest', () => console.log('⚔️ Atacando sudoeste'));

    // Ações de loja
    this.registerActionHandler('buy_item', () => console.log('💰 Comprando item'));
    this.registerActionHandler('sell_item', () => console.log('💸 Vendendo item'));
    this.registerActionHandler('quick_buy', () => console.log('⚡💰 Compra rápida'));

    // Ações de editor
    this.registerActionHandler('place_tile', () => console.log('🎨 Colocando tile'));
    this.registerActionHandler('delete_tile', () => console.log('🗑️ Deletando tile'));
    this.registerActionHandler('undo', () => console.log('↩️ Desfazendo'));
    this.registerActionHandler('redo', () => console.log('↪️ Refazendo'));
  }

  /**
   * Métodos públicos para processar entradas
   */
  processKeyboard(key: string, modifiers?: any): void {
    this.inputProcessor.processKeyboardInput(key, modifiers);
  }

  processMouse(data: any): void {
    this.inputProcessor.processMouseInput(data);
  }

  processGamepad(data: any): void {
    this.inputProcessor.processGamepadInput(data);
  }

  /**
   * Força comando específico
   */
  forceCommand(command: GameCommand): void {
    this.inputProcessor.forceCommand(command);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      currentContext: this.currentContext,
      availableCommands: COMMAND_DEFINITIONS[this.currentContext],
      inputProcessor: this.inputProcessor.getDebugInfo(),
      registeredHandlers: Array.from(this.actionHandlers.keys())
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.inputProcessor.destroy();
    this.actionHandlers.clear();
  }
}

/**
 * Exemplo de uso prático
 */
export function createGameExample(): void {
  const game = new GameCommandInterpreter();

  console.log('🎮 Iniciando exemplo de jogo...\n');

  // === CONTEXTO: MENU ===
  console.log('📋 === CONTEXTO: MENU ===');
  game.setContext(GameContext.MENU);
  
  game.processKeyboard('w');        // "1" → navigate_up
  game.processKeyboard('s');        // "3" → navigate_down  
  game.processKeyboard('2');        // "2" → select
  
  // Combinação rápida
  game.processKeyboard('1');        // Primeiro comando
  setTimeout(() => {
    game.processKeyboard('2');      // "1+2" → quick_select
  }, 100);

  setTimeout(() => {
    // === CONTEXTO: GAME ===
    console.log('\n🎯 === CONTEXTO: GAME ===');
    game.setContext(GameContext.GAME);
    
    game.processKeyboard('w');      // "1" → move_north
    game.processKeyboard('d');      // "2" → move_east
    game.processMouse({ button: 0 }); // "1" → move_north
    
    // Combinação de ataque
    game.processKeyboard('1');
    setTimeout(() => {
      game.processKeyboard('2');    // "1+2" → attack_northeast
    }, 100);
  }, 1000);

  setTimeout(() => {
    // === CONTEXTO: SHOP ===
    console.log('\n🛒 === CONTEXTO: SHOP ===');
    game.setContext(GameContext.SHOP);
    
    game.processKeyboard('w');      // "1" → scroll_up
    game.processKeyboard('d');      // "2" → buy_item
    game.forceCommand("1+2");       // Força quick_buy
  }, 2000);

  setTimeout(() => {
    // === CONTEXTO: EDITOR ===
    console.log('\n🎨 === CONTEXTO: EDITOR ===');
    game.setContext(GameContext.EDITOR);
    
    game.processKeyboard('d');      // "2" → place_tile
    game.processKeyboard('a');      // "4" → delete_tile
    game.forceCommand("1+4");       // Força undo
  }, 3000);

  setTimeout(() => {
    console.log('\n📊 === DEBUG INFO ===');
    console.log(JSON.stringify(game.getDebugInfo(), null, 2));
    
    game.destroy();
    console.log('\n✅ Exemplo finalizado!');
  }, 4000);
}

// Descomente para executar o exemplo:
// createGameExample();
