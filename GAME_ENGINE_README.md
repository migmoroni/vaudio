# VAudio Game Engine & Platform

Uma game engine e plataforma para jogos de texto/áudio interativos com arquitetura agnóstica e sistema de comandos universais.

## 🎮 Sobre o Projeto

O VAudio é uma game engine moderna projetada para jogos de texto e áudio, oferecendo:

- **Sistema de Comandos Universais**: A engine trabalha apenas com comandos [1], [2], [3], [4] e suas combinações
- **Arquitetura Agnóstica**: A engine não sabe nem precisa saber qual dispositivo de entrada foi usado
- **Separação Clara de Responsabilidades**: Input Processor → Comandos Universais → Game Engine
- **Múltiplos Modos de Interação**: Terminal console e interface visual/tátil
- **Arquitetura Compartilhada**: Core da engine compartilhado entre diferentes plataformas

## 🏗️ Nova Arquitetura Simplificada

```
shared/src/
├── types/                  # Tipos TypeScript organizados
│   ├── engine.ts          # Tipos da game engine
│   ├── input.ts           # Tipos do sistema de input
│   └── index.ts           # Re-exports
├── engine/                # Core da game engine
│   ├── VGameEngine.ts     # Implementação principal
│   └── index.ts           # Exports da engine
├── input/                 # Processador de input
│   ├── InputProcessor.ts  # Converte inputs para comandos universais
│   └── index.ts           # Exports do input
└── index.ts               # Entry point principal
```

## 🎯 Sistema de Comandos Universais

### Conceito Central

A **game engine é completamente agnóstica** ao tipo de input. Ela apenas recebe:

- **Comandos individuais**: `[1]`, `[2]`, `[3]`, `[4]`
- **Combinações**: `[1,2]`, `[2,3,4]`, `[1,2,3,4]`

### Fluxo de Dados

```
Dispositivo de Entrada → Input Processor → Comandos Universais → Game Engine
     (Teclado)              (Traduz)           ([1],[2],[3],[4])      (Executa)
     (Mouse)                (Mapeia)           (Combinações)          (Processa)
     (Gamepad)              (Converte)         (Arrays simples)       (Responde)
     (Toque)
     (Voz)
```

### Mapeamento de Entrada (Input Processor)

| Dispositivo | Entrada | Comando Universal |
|-------------|---------|-------------------|
| Teclado | W, 1, ↑ | `[1]` |
| Teclado | E, 2, → | `[2]` |  
| Teclado | S, 3, ↓ | `[3]` |
| Teclado | D, 4, ← | `[4]` |
| Mouse | Clique canto superior esquerdo | `[1]` |
| Gamepad | Botão X | `[1]` |
| Toque | Toque canto superior esquerdo | `[1]` |
| Voz | "Um" | `[1]` |

## 🎮 Como a Engine Funciona

### 1. Registrar Ações Globais

```typescript
const action: GameAction = {
  id: 'explorar',
  name: 'Explorar',
  description: 'Vai para área de exploração',
  commands: [[1]], // Responde ao comando [1]
  action: async (context) => {
    await context.engine.changeScene('explore');
  }
};

engine.registerAction(action);
```

### 2. Definir Cenas com Escolhas

```typescript
const scene: GameScene = {
  id: 'menu',
  title: 'Menu Principal',
  description: 'Escolha uma opção:',
  choices: [
    {
      id: 'start',
      text: 'Iniciar Jogo',
      commands: [[1]], // Comando [1] para esta escolha
      action: async (context) => {
        await context.engine.changeScene('game');
      }
    },
    {
      id: 'quit',
      text: 'Sair',
      commands: [[4]], // Comando [4] para sair
      action: async (context) => {
        await context.engine.stop();
      }
    }
  ]
};
```

### 3. Executar Comandos

```typescript
// A engine recebe apenas comandos universais
await engine.executeCommand([1]);       // Comando simples
await engine.executeCommand([1, 2]);    // Combinação de dois
await engine.executeCommand([1,2,3,4]); // Combinação de quatro (ajuda)
```

## 🖥️ Modo Terminal Console

O terminal console oferece interação baseada em texto com suporte aos comandos universais:

### Comandos do Sistema

- `help` ou `ajuda` → Executa `[1,2,3,4]` (ajuda do sistema)
- `status` → Executa `[2,3,4]` (status do jogo)
- `start` → Inicia a game engine
- `stop` → Para a game engine
- `debug` → Mostra informações de debug
- `clear` → Limpa o terminal

### Comandos Universais Diretos

- `1` → Executa `[1]`
- `2` → Executa `[2]`
- `3` → Executa `[3]`
- `4` → Executa `[4]`
- `12` → Executa `[1,2]`
- `123` → Executa `[1,2,3]`

### Comandos por Nome (Compatibilidade)

- `explorar` → Executa `[1]`
- `inventario` → Executa `[2]`
- `sair` → Executa `[4]`

## 🚀 Como Executar

```bash
# Instalar dependências
pnpm install

# Executar desktop em desenvolvimento
cd apps/desktop
npm run dev

# Build para produção
npm run build
```

## 🎮 Jogo de Exemplo

O projeto inclui um jogo de exemplo que demonstra:

- **Sistema de comandos universais** funcionando
- **Ações globais** que funcionam em qualquer cena
- **Escolhas por cena** com comandos específicos
- **Combinações especiais** para funções do sistema
- **Gerenciamento de estado** e navegação entre cenas

### Ações Globais do Jogo

- `[1]` - Explorar (vai para cena de exploração)
- `[2]` - Inventário (mostra itens do jogador)
- `[3]` - Ajuda personalizada do jogo
- `[4]` - Sair do jogo

### Combinações Especiais

- `[1,2,3,4]` - Ajuda do sistema (lista todas as ações)
- `[2,3,4]` - Status do jogo (estado atual)

## 🔧 Vantagens da Nova Arquitetura

### ✅ **Simplicidade**
- Engine só precisa entender números de 1 a 4
- Não há complexidade de tipos de dispositivos
- Código mais limpo e focado

### ✅ **Flexibilidade**
- Qualquer dispositivo pode ser mapeado facilmente
- Combinações ilimitadas possíveis
- Fácil de estender com novos tipos de input

### ✅ **Agnóstica**
- Engine não sabe se foi teclado, mouse, ou voz
- Input Processor faz toda a tradução
- Separação perfeita de responsabilidades

### ✅ **Robusta**
- Sistema simples é menos propenso a bugs
- Fácil de testar e debugar
- Manutenção simplificada

## 🎨 Próximas Funcionalidades

- [ ] Interface visual com botões nos 4 cantos
- [ ] Suporte completo a controles de videogame
- [ ] Sistema de comandos de voz
- [ ] Sistema de áudio integrado
- [ ] Save/Load de estados de jogo
- [ ] Editor visual de jogos
- [ ] Plugins e extensões

## 📝 Licença

Este projeto está licenciado sob a licença MIT.
