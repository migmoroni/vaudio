import { BaseInputDevice } from './BaseInputDevice';
import { InputDevice, InputMapping } from '../types/input';
import { UniversalCommand } from '../types/engine';

/**
 * Interface para dados de entrada de voz
 */
export interface VoiceInputData {
  command: string;
  confidence?: number; // 0-1, confiança do reconhecimento
  language?: string;
  duration?: number; // duração do comando em ms
  volume?: number; // volume detectado
  alternates?: string[]; // comandos alternativos reconhecidos
}

/**
 * Configuração do reconhecimento de voz
 */
interface VoiceConfig {
  language: string;
  confidenceThreshold: number; // confiança mínima para aceitar comando
  timeoutMs: number; // timeout para reconhecimento
  continuousListening: boolean; // escuta contínua ou sob demanda
  noiseThreshold: number; // threshold de ruído
}

/**
 * Dispositivo de entrada para comandos de voz
 */
export class VoiceInputDevice extends BaseInputDevice {
  private voiceConfig: VoiceConfig;
  private isListening: boolean = false;
  private synonyms: Map<string, string[]> = new Map();

  constructor(
    customMappings?: InputMapping[], 
    voiceConfig?: Partial<VoiceConfig>
  ) {
    super(InputDevice.VOICE, customMappings);
    
    this.voiceConfig = {
      language: 'pt-BR',
      confidenceThreshold: 0.7,
      timeoutMs: 5000,
      continuousListening: false,
      noiseThreshold: 0.1,
      ...voiceConfig
    };

    this.setupDefaultSynonyms();
  }

  getDefaultMappings(): InputMapping[] {
    return [
      // Comandos direcionais básicos
      { device: InputDevice.VOICE, trigger: 'cima', command: 1 },
      { device: InputDevice.VOICE, trigger: 'direita', command: 2 },
      { device: InputDevice.VOICE, trigger: 'baixo', command: 3 },
      { device: InputDevice.VOICE, trigger: 'esquerda', command: 4 },

      // Comandos numéricos
      { device: InputDevice.VOICE, trigger: 'um', command: 1 },
      { device: InputDevice.VOICE, trigger: 'dois', command: 2 },
      { device: InputDevice.VOICE, trigger: 'três', command: 3 },
      { device: InputDevice.VOICE, trigger: 'quatro', command: 4 },

      // Comandos de ação
      { device: InputDevice.VOICE, trigger: 'confirmar', command: 1 },
      { device: InputDevice.VOICE, trigger: 'cancelar', command: 2 },
      { device: InputDevice.VOICE, trigger: 'voltar', command: 3 },
      { device: InputDevice.VOICE, trigger: 'avançar', command: 4 },

      // Comandos de navegação
      { device: InputDevice.VOICE, trigger: 'próximo', command: 2 },
      { device: InputDevice.VOICE, trigger: 'anterior', command: 4 },
      { device: InputDevice.VOICE, trigger: 'selecionar', command: 1 },
      { device: InputDevice.VOICE, trigger: 'sair', command: 3 },

      // Comandos em inglês (fallback)
      { device: InputDevice.VOICE, trigger: 'up', command: 1 },
      { device: InputDevice.VOICE, trigger: 'right', command: 2 },
      { device: InputDevice.VOICE, trigger: 'down', command: 3 },
      { device: InputDevice.VOICE, trigger: 'left', command: 4 },
      { device: InputDevice.VOICE, trigger: 'yes', command: 1 },
      { device: InputDevice.VOICE, trigger: 'no', command: 2 },
    ];
  }

  matchesMapping(data: VoiceInputData, mapping: InputMapping): boolean {
    if (mapping.device !== InputDevice.VOICE) {
      return false;
    }

    // Verifica confiança mínima
    if (data.confidence && data.confidence < this.voiceConfig.confidenceThreshold) {
      return false;
    }

    const normalizedCommand = this.normalizeVoiceCommand(data.command);
    const normalizedTrigger = String(mapping.trigger).toLowerCase().trim();

    return normalizedCommand === normalizedTrigger;
  }

  validateInput(data: any): boolean {
    return data && 
           typeof data.command === 'string' && 
           data.command.trim().length > 0;
  }

  protected extractTrigger(data: VoiceInputData): string {
    return this.normalizeVoiceCommand(data.command);
  }

  /**
   * Processa comando de voz
   */
  processVoiceCommand(
    command: string, 
    confidence?: number, 
    alternates?: string[]
  ): UniversalCommand[] {
    const data: VoiceInputData = {
      command: command.trim(),
      confidence,
      alternates,
      language: this.voiceConfig.language
    };

    // Tenta primeiro com o comando principal
    let results = this.processInput(data);

    // Se não encontrou resultado e há alternativas, tenta com elas
    if (results.length === 0 && alternates) {
      for (const alt of alternates) {
        const altData: VoiceInputData = {
          ...data,
          command: alt.trim()
        };
        results = this.processInput(altData);
        if (results.length > 0) break;
      }
    }

    return results;
  }

  /**
   * Adiciona sinônimo para comando
   */
  addSynonym(baseCommand: string, synonyms: string[]): void {
    const normalizedBase = this.normalizeVoiceCommand(baseCommand);
    const normalizedSynonyms = synonyms.map(s => this.normalizeVoiceCommand(s));
    
    this.synonyms.set(normalizedBase, normalizedSynonyms);
  }

  /**
   * Remove sinônimos de um comando
   */
  removeSynonyms(baseCommand: string): void {
    const normalizedBase = this.normalizeVoiceCommand(baseCommand);
    this.synonyms.delete(normalizedBase);
  }

  /**
   * Obtém sinônimos de um comando
   */
  getSynonyms(command: string): string[] {
    const normalizedCommand = this.normalizeVoiceCommand(command);
    return this.synonyms.get(normalizedCommand) || [];
  }

  /**
   * Atualiza configuração de voz
   */
  updateVoiceConfig(config: Partial<VoiceConfig>): void {
    this.voiceConfig = { ...this.voiceConfig, ...config };
  }

  /**
   * Obtém configuração atual
   */
  getVoiceConfig(): VoiceConfig {
    return { ...this.voiceConfig };
  }

  /**
   * Define se está escutando
   */
  setListening(listening: boolean): void {
    this.isListening = listening;
  }

  /**
   * Verifica se está escutando
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Adiciona mapeamento para comando de voz específico
   */
  addVoiceMapping(command: string, universalCommand: UniversalCommand): void {
    const normalizedCommand = this.normalizeVoiceCommand(command);
    this.addMapping(normalizedCommand, universalCommand);
  }

  /**
   * Obtém informações de debug
   */
  getDebugInfo(): any {
    return {
      deviceType: this.deviceType,
      isListening: this.isListening,
      voiceConfig: this.voiceConfig,
      synonymsCount: this.synonyms.size,
      totalMappings: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([trigger, command]) => ({
        trigger,
        command,
        synonyms: this.getSynonyms(trigger as string)
      }))
    };
  }

  /**
   * Normaliza comando de voz removendo acentos, espaços extras, etc.
   */
  private normalizeVoiceCommand(command: string): string {
    return command
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Configura sinônimos padrão
   */
  private setupDefaultSynonyms(): void {
    // Sinônimos direcionais
    this.addSynonym('cima', ['acima', 'norte', 'para cima', 'subir']);
    this.addSynonym('baixo', ['abaixo', 'sul', 'para baixo', 'descer']);
    this.addSynonym('esquerda', ['oeste', 'para esquerda']);
    this.addSynonym('direita', ['leste', 'para direita']);

    // Sinônimos numéricos
    this.addSynonym('um', ['1', 'primeiro', 'uma']);
    this.addSynonym('dois', ['2', 'segundo', 'duas']);
    this.addSynonym('três', ['3', 'terceiro', 'tres']);
    this.addSynonym('quatro', ['4', 'quarto']);

    // Sinônimos de ação
    this.addSynonym('confirmar', ['ok', 'sim', 'aceitar', 'concordar']);
    this.addSynonym('cancelar', ['não', 'nao', 'recusar', 'negar']);
    this.addSynonym('voltar', ['retornar', 'anterior', 'volta']);
    this.addSynonym('avançar', ['próximo', 'proximo', 'continuar', 'seguir']);

    // Sinônimos de navegação
    this.addSynonym('selecionar', ['escolher', 'pegar', 'usar']);
    this.addSynonym('sair', ['fechar', 'terminar', 'finalizar']);
  }

  /**
   * Processa comando considerando sinônimos
   */
  processInput(data: VoiceInputData): UniversalCommand[] {
    const normalizedCommand = this.normalizeVoiceCommand(data.command);
    
    // Tenta primeiro o comando direto
    let command = this.mappings.get(normalizedCommand);
    if (command) {
      return [command];
    }

    // Procura por sinônimos
    for (const [baseCommand, synonyms] of this.synonyms) {
      if (synonyms.includes(normalizedCommand)) {
        command = this.mappings.get(baseCommand);
        if (command) {
          return [command];
        }
      }
    }

    return [];
  }

  /**
   * Verifica se um comando está mapeado (incluindo sinônimos)
   */
  isCommandMapped(command: string): boolean {
    const normalizedCommand = this.normalizeVoiceCommand(command);
    
    // Verifica comando direto
    if (this.mappings.has(normalizedCommand)) {
      return true;
    }

    // Verifica sinônimos
    for (const synonyms of this.synonyms.values()) {
      if (synonyms.includes(normalizedCommand)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtém comando universal para um comando de voz
   */
  getCommandForVoice(command: string): UniversalCommand | undefined {
    const results = this.processVoiceCommand(command);
    return results.length > 0 ? results[0] : undefined;
  }
}
