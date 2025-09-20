/**
 * Tipos de comando para o sistema de entrada
 */

/**
 * Comandos básicos individuais
 */
export type BasicCommand = "1" | "2" | "3" | "4";

/**
 * Comandos combinados
 */
export type CombinedCommand = "1+2" | "1+4" | "3+2" | "3+4";

/**
 * Todos os comandos possíveis do sistema
 */
export type GameCommand = BasicCommand | CombinedCommand;

/**
 * Lista de todos os comandos válidos
 */
export const VALID_COMMANDS: GameCommand[] = [
  // Comandos individuais
  "1", "2", "3", "4",
  // Comandos combinados
  "1+2", "1+4", "3+2", "3+4"
];

/**
 * Interface para evento de comando processado
 */
export interface CommandEvent {
  command: GameCommand;
  timestamp: number;
  device: string;
  originalInput?: any;
}

/**
 * Interface para combinação de comandos em processamento
 */
export interface CommandCombination {
  commands: Set<BasicCommand>;
  startTime: number;
  timeout: NodeJS.Timeout;
}

/**
 * Configuração do processador de comandos
 */
export interface CommandProcessorConfig {
  combinationTimeout: number; // Tempo limite para combinações (ms)
  enableCombinations: boolean; // Permitir comandos combinados
  debugMode: boolean; // Modo debug para logs
}

/**
 * Converte números para comandos básicos
 */
export function numberToBasicCommand(num: number): BasicCommand | null {
  switch (num) {
    case 1: return "1";
    case 2: return "2";
    case 3: return "3";
    case 4: return "4";
    default: return null;
  }
}

/**
 * Verifica se uma combinação de comandos é válida
 */
export function isValidCombination(commands: Set<BasicCommand>): CombinedCommand | null {
  if (commands.size !== 2) return null;
  
  const commandArray = Array.from(commands).sort();
  const combination = commandArray.join("+") as CombinedCommand;
  
  if (VALID_COMMANDS.includes(combination)) {
    return combination;
  }
  
  return null;
}

/**
 * Quebra comando combinado em comandos básicos
 */
export function splitCombinedCommand(command: CombinedCommand): BasicCommand[] {
  return command.split("+") as BasicCommand[];
}
