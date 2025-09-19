# VAudio Game Engine & Platform

Uma game engine e plataforma para jogos de texto/áudio interativos com suporte a múltiplos dispositivos de entrada e modos de interação.

## 🎮 Sobre o Projeto

O VAudio é uma game engine moderna projetada para jogos de texto e áudio, oferecendo:

- **Sistema de Input Unificado**: Suporte para teclado, mouse, controles de videogame, toque na tela e comandos de voz
- **Arquitetura Compartilhada**: Core da engine compartilhado entre diferentes plataformas (Desktop, Web, Mobile)
- **Múltiplos Modos de Interação**: Terminal console e interface visual/tátil
- **Sistema de Botões Virtuais**: 4 botões posicionados nos cantos da tela para interação universal

## 🏗️ Arquitetura

```
├── shared/                 # Código compartilhado
│   ├── src/
│   │   ├── types.ts       # Tipos TypeScript
│   │   ├── game-engine.ts # Core da game engine
│   │   ├── input-processor.ts # Processador de comandos
│   │   └── engine.ts      # Exports principais
│   └── components/        # Componentes compartilhados
├── apps/
│   ├── desktop/          # App Tauri para desktop
│   ├── web/              # App web com Vite
│   └── mobile/           # App React Native/Expo
```

## 🎯 Sistema de Input

### Mapeamento de Botões Virtuais

O sistema utiliza 4 botões virtuais posicionados nos cantos da tela:

- **Botão 1 (TOP_LEFT)**: Canto superior esquerdo
- **Botão 2 (TOP_RIGHT)**: Canto superior direito  
- **Botão 3 (BOTTOM_LEFT)**: Canto inferior esquerdo
- **Botão 4 (BOTTOM_RIGHT)**: Canto inferior direito

### Mapeamento de Teclado

| Tecla | Botão Virtual | Descrição |
|-------|---------------|-----------|
| W, 1, ↑ | Botão 1 | Top Left |
| E, 2, → | Botão 2 | Top Right |
| S, 3, ↓ | Botão 3 | Bottom Left |
| D, 4, ← | Botão 4 | Bottom Right |

## 🖥️ Modo Terminal Console

O modo terminal console oferece interação baseada em texto com:

- **Comandos do Sistema**:
  - `help` - Lista comandos disponíveis
  - `status` - Mostra estado atual do jogo
  - `start` - Inicia a game engine
  - `stop` - Para a game engine
  - `debug` - Informações de debug
  - `clear` - Limpa o terminal
  - `history` - Histórico de comandos

- **Recursos**:
  - Histórico de comandos (↑/↓ para navegar)
  - Auto-scroll para novos outputs
  - Indicador de status da engine
  - Timestamps nos outputs
  - Cores diferenciadas por tipo de conteúdo

## 🚀 Como Executar

### Desktop (Tauri)

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
cd apps/desktop
npm run dev

# Build para produção
npm run build
```

### Web

```bash
cd apps/web
npm run dev
```

### Mobile

```bash
cd apps/mobile
npm run start
```

## 🎮 Jogo de Exemplo

O projeto inclui um jogo de exemplo demonstrando:

- Sistema de cenas interativas
- Comandos personalizados
- Gerenciamento de estado
- Sistema de pontuação
- Inventário de itens
- Navegação entre cenas

### Comandos do Jogo de Exemplo

- `explorar` ou Botão 1 - Ir para área de exploração
- `inventario` ou Botão 2 - Ver inventário
- `ajuda` ou Botão 3 - Mostrar ajuda
- `sair` ou Botão 4 - Sair do jogo
- `1`, `2`, `3`, `4` - Escolher opções numeradas nas cenas

## 🔧 Desenvolvimento

### Estrutura de uma Cena

```typescript
const scene: GameScene = {
  id: 'exemplo',
  title: 'Título da Cena',
  description: 'Descrição detalhada...',
  choices: [
    {
      id: 'opcao1',
      text: 'Primeira opção',
      action: async (context) => {
        // Lógica da ação
      }
    }
  ],
  onEnter: async (context) => {
    // Executado ao entrar na cena
  },
  onExit: async (context) => {
    // Executado ao sair da cena
  }
};
```

### Registrar Comandos Personalizados

```typescript
engine.registerCommand({
  id: 'meu_comando',
  name: 'Meu Comando',
  description: 'Descrição do comando',
  combinations: [
    { buttons: [ButtonType.TOP_LEFT] }
  ],
  action: async (context) => {
    // Lógica do comando
  }
});
```

### Sistema de Eventos

```typescript
// Escutar eventos da engine
engine.on('scene:changed', (data) => {
  console.log('Cena mudou:', data);
});

engine.on('game:output', (output) => {
  console.log('Novo output:', output);
});
```

## 🎨 Próximas Funcionalidades

- [ ] Suporte completo a controles de videogame
- [ ] Sistema de comandos de voz
- [ ] Interface visual/tátil
- [ ] Sistema de áudio integrado
- [ ] Save/Load de estados de jogo
- [ ] Multiplayer básico
- [ ] Editor visual de jogos
- [ ] Plugins e extensões

## 📝 Licença

Este projeto está licenciado sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, veja o arquivo CONTRIBUTING.md para detalhes sobre como contribuir para este projeto.
