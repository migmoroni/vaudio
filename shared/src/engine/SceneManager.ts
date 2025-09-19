import { GameScene, GameContext, GameOutput } from '../types/engine';
import { EventManager } from './EventManager';

/**
 * Gerenciador de cenas do jogo
 * Responsável por gerenciar, trocar e executar lógica das cenas
 */
export class SceneManager {
  private scenes: Map<string, GameScene> = new Map();
  private currentSceneId: string = '';
  private eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
  }

  /**
   * Registra uma nova cena
   */
  registerScene(scene: GameScene): void {
    this.scenes.set(scene.id, scene);
  }

  /**
   * Remove uma cena
   */
  unregisterScene(sceneId: string): void {
    this.scenes.delete(sceneId);
  }

  /**
   * Obtém uma cena pelo ID
   */
  getScene(sceneId: string): GameScene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Obtém a cena atual
   */
  getCurrentScene(): GameScene | undefined {
    return this.currentSceneId ? this.scenes.get(this.currentSceneId) : undefined;
  }

  /**
   * Obtém o ID da cena atual
   */
  getCurrentSceneId(): string {
    return this.currentSceneId;
  }

  /**
   * Lista todas as cenas registradas
   */
  getAllScenes(): GameScene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Verifica se uma cena existe
   */
  hasScene(sceneId: string): boolean {
    return this.scenes.has(sceneId);
  }

  /**
   * Muda para uma nova cena
   */
  async changeScene(sceneId: string, context: GameContext): Promise<void> {
    const newScene = this.scenes.get(sceneId);
    if (!newScene) {
      this.eventManager.emit({
        type: 'error',
        data: { message: `Cena não encontrada: ${sceneId}` }
      });
      return;
    }

    const currentScene = this.getCurrentScene();
    const previousSceneId = this.currentSceneId;

    // Executa onExit da cena atual
    if (currentScene && currentScene.onExit) {
      try {
        await currentScene.onExit(context);
      } catch (error) {
        this.eventManager.emit({
          type: 'error',
          data: {
            message: `Erro ao sair da cena ${previousSceneId}`,
            error
          }
        });
      }
    }

    // Atualiza cena atual
    this.currentSceneId = sceneId;

    // Executa onEnter da nova cena
    if (newScene.onEnter) {
      try {
        await newScene.onEnter(context);
      } catch (error) {
        this.eventManager.emit({
          type: 'error',
          data: {
            message: `Erro ao entrar na cena ${sceneId}`,
            error
          }
        });
      }
    }

    // Emite mudança de cena
    this.eventManager.emit({
      type: 'scene_changed',
      data: {
        previousScene: previousSceneId,
        currentScene: sceneId,
        scene: newScene
      }
    });

    // Emite conteúdo da cena
    this.emitSceneOutput(newScene, context);
  }

  /**
   * Emite o output da cena (descrição e opções)
   */
  private emitSceneOutput(scene: GameScene, context: GameContext): void {
    // Mostra conteúdo da cena
    const sceneOutput: GameOutput = {
      type: 'scene_change',
      content: `=== ${scene.title} ===\n${scene.description}`,
      timestamp: Date.now(),
      metadata: { scene }
    };

    this.eventManager.emit({ type: 'output', data: sceneOutput });

    // Mostra opções se houver
    if (scene.choices && scene.choices.length > 0) {
      const availableChoices = scene.choices.filter(choice => 
        !choice.condition || choice.condition(context)
      );

      if (availableChoices.length > 0) {
        const choicesText = availableChoices
          .map((choice, index) => {
            const commandsText = choice.commands
              .map(cmd => `[${cmd.join(',')}]`)
              .join(' ou ');
            return `${index + 1}. ${choice.text} (${commandsText})`;
          })
          .join('\n');

        const choiceOutput: GameOutput = {
          type: 'choice',
          content: `Opções:\n${choicesText}`,
          timestamp: Date.now()
        };

        this.eventManager.emit({ type: 'output', data: choiceOutput });
      }
    }
  }

  /**
   * Retorna informações de debug sobre cenas
   */
  getDebugInfo(): any {
    return {
      totalScenes: this.scenes.size,
      currentScene: this.currentSceneId,
      sceneIds: Array.from(this.scenes.keys())
    };
  }
}
