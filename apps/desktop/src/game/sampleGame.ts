import { VGameEngine, GameScene, GameAction } from '../../../../shared/src';

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
Você pode usar comandos universais [1], [2], [3], [4] ou suas combinações.

Comandos disponíveis:
- [1] ou comando "explorar": Explorar a área
- [2] ou comando "inventario": Ver seu inventário  
- [3] ou comando "ajuda": Ver comandos
- [4] ou comando "sair": Sair do jogo`,
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
O que você gostaria de fazer?`,
    choices: [
      {
        id: 'enter_forest',
        text: 'Entrar na floresta',
        commands: [[1]], // Comando [1] para entrar na floresta
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
        commands: [[2]], // Comando [2] para voltar
        action: async (context) => {
          await context.engine.changeScene('intro');
        }
      },
      {
        id: 'search_items',
        text: 'Procurar por itens',
        commands: [[3]], // Comando [3] para procurar
        action: async (context) => {
          context.engine.updateState({
            variables: { ...context.state.variables, hasItem: true }
          });
          // Simula encontrar um item usando o novo sistema de eventos
          (context.engine as any).emitOutput({
            type: 'text',
            content: 'Você encontrou uma poção de cura!',
            timestamp: Date.now()
          });
        }
      },
      {
        id: 'rest',
        text: 'Descansar',
        commands: [[4]], // Comando [4] para descansar
        action: async (context) => {
          (context.engine as any).emitOutput({
            type: 'text',
            content: 'Você descansou e recuperou energia.',
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

O que você faz agora?`,
    choices: [
      {
        id: 'deeper',
        text: 'Ir mais fundo na floresta',
        commands: [[1]],
        action: async (context) => {
          (context.engine as any).emitOutput({
            type: 'text',
            content: 'Você se aventura mais fundo na floresta misteriosa...',
            timestamp: Date.now()
          });
        }
      },
      {
        id: 'back_explore',
        text: 'Voltar para a área de exploração',
        commands: [[2]],
        action: async (context) => {
          await context.engine.changeScene('explore');
        }
      },
      {
        id: 'fire',
        text: 'Acender uma fogueira',
        commands: [[3]],
        action: async (context) => {
          (context.engine as any).emitOutput({
            type: 'text',
            content: 'Você acende uma fogueira. A luz afasta as sombras.',
            timestamp: Date.now()
          });
        }
      },
      {
        id: 'listen',
        text: 'Escutar os sons',
        commands: [[4]],
        action: async (context) => {
          (context.engine as any).emitOutput({
            type: 'text',
            content: 'Você escuta atentamente... Os sons parecem vir de todas as direções.',
            timestamp: Date.now()
          });
        }
      }
    ],
    onEnter: async (context) => {
      const score = context.state.variables.score || 0;
      (context.engine as any).emitOutput({
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

  // Registra ações globais
  const explorarAction: GameAction = {
    id: 'explorar',
    name: 'Explorar',
    description: 'Vai para a área de exploração',
    commands: [[1]], // Comando universal [1]
    action: async (context) => {
      await context.engine.changeScene('explore');
    }
  };

  const inventarioAction: GameAction = {
    id: 'inventario',
    name: 'Inventário',
    description: 'Mostra seu inventário',
    commands: [[2]], // Comando universal [2]
    action: (context) => {
      const hasItem = context.state.variables.hasItem;
      const inventoryText = hasItem 
        ? 'Inventário:\n- Poção de cura' 
        : 'Inventário vazio';
      
      (context.engine as any).emitOutput({
        type: 'text',
        content: inventoryText,
        timestamp: Date.now()
      });
    }
  };

  const ajudaAction: GameAction = {
    id: 'ajuda',
    name: 'Ajuda Personalizada',
    description: 'Mostra ajuda específica do jogo',
    commands: [[3]], // Comando universal [3]
    action: (context) => {
      const helpText = `
Comandos do VAudio Game Engine:
- [1] = Explorar / Primeira opção
- [2] = Inventário / Segunda opção  
- [3] = Ajuda / Terceira opção
- [4] = Sair / Quarta opção

Combinações especiais:
- [1,2,3,4] = Ajuda do sistema
- [2,3,4] = Status do jogo

Use os números 1-4 no teclado ou W/E/S/D ou setas direcionais.
      `;
      
      (context.engine as any).emitOutput({
        type: 'text',
        content: helpText,
        timestamp: Date.now()
      });
    }
  };

  const sairAction: GameAction = {
    id: 'sair',
    name: 'Sair',
    description: 'Sai do jogo',
    commands: [[4]], // Comando universal [4]
    action: async (context) => {
      (context.engine as any).emitOutput({
        type: 'text',
        content: 'Obrigado por jogar VAudio! Até logo!',
        timestamp: Date.now()
      });
      await context.engine.stop();
    }
  };

  // Registra as ações
  engine.registerAction(explorarAction);
  engine.registerAction(inventarioAction);
  engine.registerAction(ajudaAction);
  engine.registerAction(sairAction);

  return engine;
}
