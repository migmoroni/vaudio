import { VGameEngine, GameScene, ButtonType } from '../../../../shared/src/engine';

export function createSampleGame(): VGameEngine {
  const engine = new VGameEngine({
    currentScene: 'intro',
    variables: { score: 0 },
    history: [],
    player: { name: 'Jogador' }
  });

  // Cena de introdução
  const introScene: GameScene = {
    id: 'intro',
    title: 'Bem-vindo ao VAudio',
    description: `Bem-vindo ao VAudio Game Engine!
    
Este é um exemplo de jogo de texto/áudio interativo.
Você pode usar comandos de texto ou os botões virtuais.

Comandos disponíveis:
- "explorar" ou botão 1: Explorar a área
- "inventario" ou botão 2: Ver seu inventário  
- "ajuda" ou botão 3: Ver comandos
- "sair" ou botão 4: Sair do jogo`,
    onEnter: async () => {
      console.log('Entrando na cena de introdução');
    }
  };

  // Cena de exploração
  const exploreScene: GameScene = {
    id: 'explore',
    title: 'Explorando',
    description: `Você está explorando uma área misteriosa.
    
Você encontra uma floresta densa à sua frente.
O que você gostaria de fazer?

1. Entrar na floresta
2. Voltar para o início
3. Procurar por itens
4. Descansar`,
    choices: [
      {
        id: 'enter_forest',
        text: 'Entrar na floresta',
        action: async (context) => {
          context.engine.updateState({
            variables: { ...context.state.variables, score: context.state.variables.score + 10 }
          });
          await context.engine.changeScene('forest');
        }
      },
      {
        id: 'go_back',
        text: 'Voltar para o início',
        action: async (context) => {
          await context.engine.changeScene('intro');
        }
      },
      {
        id: 'search_items',
        text: 'Procurar por itens',
        action: async (context) => {
          context.engine.updateState({
            variables: { ...context.state.variables, hasItem: true }
          });
          // Simula encontrar um item
          (context.engine as any).emit('game:output', {
            type: 'text',
            content: 'Você encontrou uma poção de cura!',
            timestamp: Date.now()
          });
        }
      }
    ]
  };

  // Cena da floresta
  const forestScene: GameScene = {
    id: 'forest',
    title: 'Floresta Misteriosa',
    description: `Você entrou na floresta...
    
A floresta é densa e escura. Você pode ouvir sons estranhos.
Sua pontuação atual: ${0} pontos.

O que você faz agora?

1. Ir mais fundo na floresta
2. Voltar para a área de exploração
3. Acender uma fogueira
4. Escutar os sons`,
    onEnter: async (context) => {
      const score = context.state.variables.score || 0;
      (context.engine as any).emit('game:output', {
        type: 'text',
        content: `Pontuação atual: ${score} pontos`,
        timestamp: Date.now()
      });
    }
  };

  // Registra as cenas
  engine.registerScene(introScene);
  engine.registerScene(exploreScene);
  engine.registerScene(forestScene);

  // Registra comandos personalizados
  engine.registerCommand({
    id: 'explorar',
    name: 'Explorar',
    description: 'Vai para a área de exploração',
    combinations: [
      { buttons: [ButtonType.TOP_LEFT] }
    ],
    action: async (context) => {
      await context.engine.changeScene('explore');
    }
  });

  engine.registerCommand({
    id: 'inventario',
    name: 'Inventário',
    description: 'Mostra seu inventário',
    combinations: [
      { buttons: [ButtonType.TOP_RIGHT] }
    ],
    action: (context) => {
      const hasItem = context.state.variables.hasItem;
      const inventoryText = hasItem 
        ? 'Inventário:\n- Poção de cura' 
        : 'Inventário vazio';
      
      (context.engine as any).emit('game:output', {
        type: 'text',
        content: inventoryText,
        timestamp: Date.now()
      });
    }
  });

  engine.registerCommand({
    id: 'sair',
    name: 'Sair',
    description: 'Sai do jogo',
    combinations: [
      { buttons: [ButtonType.BOTTOM_RIGHT] }
    ],
    action: async (context) => {
      (context.engine as any).emit('game:output', {
        type: 'text',
        content: 'Obrigado por jogar VAudio! Até logo!',
        timestamp: Date.now()
      });
      await context.engine.stop();
    }
  });

  // Comando para escolher opções numeradas
  for (let i = 1; i <= 4; i++) {
    engine.registerCommand({
      id: `escolha_${i}`,
      name: `Escolha ${i}`,
      description: `Seleciona a opção ${i}`,
      combinations: [],
      action: async (context) => {
        const currentScene = context.scenes.get(context.state.currentScene);
        if (currentScene && currentScene.choices && currentScene.choices[i - 1]) {
          await currentScene.choices[i - 1].action(context);
        } else {
          (context.engine as any).emit('game:output', {
            type: 'text',
            content: `Opção ${i} não disponível nesta cena.`,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  return engine;
}
