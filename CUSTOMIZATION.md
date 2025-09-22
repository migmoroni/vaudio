# Exemplo: Como Customizar Mensagens do Vaudio

O sistema vaudio é totalmente parametrizável através de arquivos JSON. Aqui estão exemplos de como customizar as mensagens.

## Mensagens do CLI (`program/cli/messages.json`)

```json
{
  "app": {
    "name": "meu-vaudio-cli", 
    "description": "Minha plataforma personalizada"
  },
  "messages": {
    "starting": "🚀 Iniciando minha plataforma...",
    "basePath": "Pasta base: {path}",
    "initialized": "✨ Sistema carregado!",
    "error": "💥 Erro:",
    "exiting": "👋 Até logo!"
  },
  "help": {
    "title": "meu-vaudio-cli - Minha plataforma personalizada",
    "commands": {
      "title": "Comandos disponíveis:",
      "items": [
        {
          "command": "start [pasta]",
          "description": "Iniciar a plataforma"
        }
      ]
    }
  }
}
```

## Mensagens dos Componentes (`program/components/messages.json`)

```json
{
  "renderer": {
    "console": {
      "waiting": "⏳ Esperando sua escolha...",
      "availableChoices": "🎯 Opções:",
      "navigation": "🧭 Como navegar:",
      "controls": "Use 1-4 ou q,w,e,r",
      "exit": "❌ Ctrl+C para sair"
    }
  },
  "engine": {
    "errors": {
      "optionNotAvailable": "❌ Esta opção não está disponível.",
      "commandNotRecognized": "❓ Comando desconhecido.",
      "choiceNotAvailable": "🚫 Escolha inválida."
    },
    "info": {
      "gameInfoTitle": "📊 === INFORMAÇÕES ===",
      "game": "🎮 Jogo: {title}",
      "currentScene": "📍 Local: {scene}",
      "inventory": "🎒 Itens: {items}",
      "emptyInventory": "vazio"
    }
  }
}
```

## Personalizando Programas

### Menu Principal Personalizado (`program/initial/menu.json`)

```json
{
  "id": "menu_principal", 
  "description": "Bem-vindo à minha plataforma! Escolha uma opção abaixo.",
  "choice": {
    "1": {
      "label": "Meus Jogos",
      "goto": "@/meus-jogos/lista.json"
    },
    "2": {
      "label": "Configurações",
      "goto": "@/config/menu.json"
    },
    "3": {
      "label": "Sobre",
      "goto": "@/sobre/info.json"
    },
    "3+4": {
      "label": "Sair",
      "goto": "*"
    }
  }
}
```

### Menu com Submenus (`program/meus-jogos/lista.json`)

```json
{
  "id": "lista_jogos",
  "description": "Escolha um dos meus jogos favoritos:",
  "choice": {
    "1": {
      "label": "Aventuras",
      "choice": {
        "1": {"label": "Floresta Mágica", "goto": "games/floresta"},
        "2": {"label": "Castelo Sombrio", "goto": "games/castelo"},
        "3+4": {"label": "Voltar", "goto": "-"}
      }
    },
    "2": {
      "label": "Puzzles",
      "choice": {
        "1": {"label": "Labirinto", "goto": "games/labirinto"},
        "2": {"label": "Enigmas", "goto": "games/enigmas"},
        "3+4": {"label": "Voltar", "goto": "-"}
      }
    },
    "3+4": {
      "label": "Voltar ao menu principal",
      "goto": "-"
    }
  }
}
```

## Tipos de Navegação

- `"@/caminho/arquivo.json"` - Carrega outro programa
- `"games/nome-do-jogo"` - Inicia um jogo  
- `"-"` - Volta ao programa anterior
- `"*"` - Sai da aplicação

## Suporte a Idiomas

Você pode criar diferentes versões dos arquivos JSON para diferentes idiomas:

```
program/
├── cli/
│   ├── messages.json      # Português
│   ├── messages.en.json   # Inglês  
│   └── messages.es.json   # Espanhol
├── components/
│   ├── messages.json      # Português
│   ├── messages.en.json   # Inglês
│   └── messages.es.json   # Espanhol
```

## Variáveis nas Mensagens

Algumas mensagens suportam variáveis:

- `{path}` - Caminho do arquivo
- `{title}` - Título do jogo
- `{scene}` - Nome da cena atual
- `{items}` - Lista de itens do inventário
- `{goto}` - Destino da navegação

## Estrutura Completa de Personalização

```
minha-plataforma/
├── program/
│   ├── cli/messages.json           # Mensagens do CLI
│   ├── components/messages.json    # Mensagens da engine
│   ├── initial/menu.json          # Menu inicial
│   ├── meus-jogos/
│   │   ├── lista.json
│   │   └── categorias.json
│   ├── config/
│   │   ├── menu.json
│   │   ├── audio.json
│   │   └── teclado.json
│   └── sobre/
│       └── info.json
└── games/
    ├── floresta/
    ├── castelo/
    ├── labirinto/
    └── enigmas/
```

Com essa estrutura, você pode criar uma experiência completamente personalizada mantendo o código estrutural intacto!
