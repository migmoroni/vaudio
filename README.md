# Vaudio - Plataforma de Jogos de Texto/Audio

Uma plataforma multiplataforma para criar e executar jogos de texto e audio, construída com TypeScript. O sistema é baseado inteiramente em arquivos JSON para configuração de programas e jogos.

## Estrutura do Projeto

```
vaudio/
├── apps/
│   ├── components/     # Engine compartilhada e componentes
│   ├── cli/           # App CLI (implementado)
│   ├── desktop/       # App Desktop (Tauri + React) - TODO
│   ├── mobile/        # App Mobile (React Native) - TODO
│   └── web/           # App Web (React + Vite) - TODO
├── games/
│   └── 0000-Standard/ # Jogo de exemplo
└── program/           # Programas do sistema em JSON
    ├── initial/       # Menu inicial
    ├── about/         # Informações
    ├── game/          # Seletor de jogos
    ├── store/         # Loja
    ├── editor/        # Editor
    ├── settings/      # Configurações
    └── help/          # Ajuda
```

## Status Atual

✅ **Implementado:**
- **VaudioEngine**: Engine principal que gerencia programas e jogos
- **Sistema de Programas JSON**: Todos os menus e funcionalidades baseados em JSON
- **Menu Inicial**: `program/initial/menu.json` como ponto de entrada
- **Sistema de input por teclado** com 8 comandos
- **Renderer para console** que suporta programas e jogos
- **App CLI funcional** com interface parametrizável
- **Navegação completa** entre programas e jogos

🔄 **Em desenvolvimento:**
- Apps Desktop, Mobile e Web

## Como Usar

### Instalação

```bash
# Instalar dependências
pnpm install

# Fazer build dos componentes
pnpm build:shared

# Fazer build do CLI
pnpm build:cli
```

### Executar Vaudio

```bash
# Iniciar vaudio (carrega program/initial/menu.json)
pnpm play

# Ou executar diretamente
node apps/cli/dist/index.js start

# Ver ajuda
node apps/cli/dist/index.js help
```

## Sistema de Navegação

O vaudio inicia automaticamente carregando `program/initial/menu.json` e permite navegar por:

### Menu Principal:
- **1**: About - Informações sobre a plataforma
- **2**: Programs - Submenu com opções de programas
  - **1**: Game - Seletor de jogos
  - **2**: Store - Loja de conteúdo
  - **3**: Editor - Editor de jogos
  - **r**: Voltar
- **3**: Settings - Configurações da aplicação
- **4**: Help - Ajuda e documentação
- **r**: Sair para desktop

## Sistema de Comandos

### Comandos Básicos:
- **1,2,3,4**: Escolhas diretas
- **q (1+2)**: Menu/Submenu
- **w (1+4)**: Informações
- **e (2+3)**: [Reservado]
- **r (3+4)**: Repetir/Voltar

### Comandos Especiais:
- **Ctrl+C**: Sair da aplicação

## Estrutura dos Programas (JSON)

Cada programa é um arquivo JSON com a seguinte estrutura:

```json
{
  "id": "nome_do_programa",
  "description": "Descrição que aparece na tela",
  "choice": {
    "1": {
      "label": "Opção 1",
      "goto": "@/caminho/programa.json"
    },
    "2": {
      "label": "Opção 2", 
      "choice": {
        "1": {"label": "Sub-opção", "goto": "..."},
        "3+4": {"label": "Voltar", "goto": "-"}
      }
    },
    "3+4": {
      "label": "Voltar",
      "goto": "-"
    }
  }
}
```

### Tipos de Navegação:
- `"@/caminho/arquivo.json"`: Carregar outro programa
- `"games/nome-do-jogo"`: Carregar um jogo
- `"-"`: Voltar ao programa anterior
- `"*"`: Sair da aplicação

## Estrutura de um Jogo

Os jogos mantêm a estrutura anterior:

```
meu-jogo/
├── main.json          # Configuração principal
├── scene/            # Cenas do jogo
│   ├── intro.json
│   └── ...
├── npc/              # NPCs
├── item/             # Itens
├── rule/             # Regras do jogo
├── narrative/        # Narrativas
└── action/           # Ações especiais
```

## Arquitetura

### VaudioEngine
- **Gerencia dois modos**: `program` (menus JSON) e `game` (jogos)
- **Navegação**: Stack de programas para voltar corretamente
- **Estado da aplicação**: Mantém contexto atual e histórico
- **Transições**: Entre programas e jogos de forma transparente

### Fluxo de Execução

1. **CLI** inicializa **VaudioEngine** apontando para a pasta base
2. **Engine** carrega automaticamente `program/initial/menu.json`
3. **Renderer** exibe o programa atual
4. **InputHandler** captura comandos do usuário
5. **Engine** processa navegação entre programas ou inicia jogos
6. Loop continua até comando de saída

### Sistema Totalmente Parametrizável

- **Nenhum texto hardcoded**: Tudo vem dos arquivos JSON
- **Fácil customização**: Apenas edite os arquivos JSON
- **Navegação flexível**: Sistema de goto permite qualquer estrutura
- **Extensível**: Adicione novos programas criando novos JSONs

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev:cli          # Watch mode para CLI
pnpm dev              # Watch mode para tudo

# Build
pnpm build:shared     # Build componentes compartilhados
pnpm build:cli        # Build CLI
pnpm build            # Build tudo

# Executar
pnpm start:cli        # Executar CLI
pnpm play            # Build e executar vaudio

# Utilidades
pnpm clean            # Limpar builds
pnpm type-check       # Verificar tipos
pnpm format           # Formatar código
pnpm lint             # Verificar código
```

## Exemplo de Uso

1. Execute `pnpm play`
2. Navegue com `2` (Programs) 
3. Escolha `1` (Game)
4. Selecione `1` (Jogo Standard)
5. Jogue o jogo usando as teclas 1-4
6. Use `q` durante o jogo para voltar ao menu
7. Use `r` nos menus para voltar
8. Use `r` no menu principal para sair

## Próximos Passos

1. **Completar programas**: Implementar funcionalidades de Store, Editor, Settings
2. **Apps Desktop/Web/Mobile**: Usar a mesma engine com interfaces diferentes
3. **Sistema de Audio**: Adicionar suporte a narração e efeitos sonoros
4. **Editor Visual**: Interface gráfica para criar programas e jogos
5. **Multiplayer**: Suporte a jogos multi-jogador

## Tecnologias

- **TypeScript**: Linguagem principal
- **Node.js**: Runtime
- **PNPM**: Gerenciador de pacotes
- **JSON**: Configuração de programas e jogos
- **Biome**: Linting e formatação
