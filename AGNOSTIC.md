# Sistema Agnóstico do Vaudio

O vaudio foi projetado para ser **completamente agnóstico** - o código contém apenas a lógica estrutural, enquanto todo o comportamento, textos e fluxos são definidos por arquivos JSON.

## Princípios do Design Agnóstico

### ✅ **O que está no código:**
- Lógica de carregamento de JSON
- Estruturas de dados e tipos
- Algoritmos de navegação e renderização
- Gerenciamento de estado e input

### ❌ **O que NÃO está no código:**
- Textos e mensagens
- Comandos específicos
- Estrutura de menus
- Fluxos de navegação
- Nomes de opções

## Arquitetura Agnóstica

### CLI Engine (`apps/cli/src/index.ts`)

```typescript
// ✅ Código estrutural apenas
class CLIEngine {
  private config: any;  // Todo comportamento vem do JSON
  
  async execute() {
    const command = this.args[0] || this.config.defaultCommand;
    const commandConfig = this.config.commands[command];
    
    // Executa ação baseada no JSON, não hardcoded
    switch (commandConfig.action) {
      case 'load_program': await this.loadProgram(commandConfig); break;
      case 'show_help': this.showHelp(); break;
    }
  }
}
```

### VaudioEngine (`apps/components/src/engine/core.ts`)

```typescript
// ✅ Lógica estrutural
export class VaudioEngine {
  // Carrega mensagens do JSON
  private async loadMessages() {
    const messagesData = await fs.readFile(messagesPath, 'utf-8');
    this.messages = JSON.parse(messagesData);
  }
  
  // Usa mensagens do JSON, não hardcoded
  private async handleError(type: string, context: any) {
    const message = this.messages.engine?.errors?.[type]?.replace('{context}', context);
    await this.renderer.showMessage(message);
  }
}
```

### Console Renderer (`apps/components/src/renderer/console.ts`)

```typescript
// ✅ Renderização estrutural
export class ConsoleRenderer {
  // Carrega textos do JSON
  constructor() {
    this.loadMessages();
  }
  
  // Usa textos do JSON
  async renderProgram(program: Program) {
    console.log(this.messages.renderer?.console?.availableChoices || 'Fallback');
  }
}
```

## Configuração Total via JSON

### 1. Configuração do CLI (`program/cli/config.json`)

```json
{
  "defaultCommand": "start",          // ← Define comando padrão
  "commands": {                       // ← Define comandos disponíveis
    "start": {
      "action": "load_program",       // ← Ação estrutural
      "target": "program/initial/menu.json"
    },
    "help": {
      "action": "show_help"
    }
  },
  "messages": {                       // ← Todas as mensagens
    "starting": "🎮 Iniciando...",
    "error": "❌ Erro:"
  }
}
```

### 2. Mensagens dos Componentes (`program/components/messages.json`)

```json
{
  "renderer": {
    "console": {
      "waiting": "⏳ Aguardando comando...",     // ← Texto da interface
      "availableChoices": "📋 Opções:"
    }
  },
  "engine": {
    "errors": {
      "optionNotAvailable": "❌ Opção inválida"  // ← Mensagens de erro
    }
  }
}
```

### 3. Programas do Sistema (`program/*/menu.json`)

```json
{
  "id": "menu_principal",
  "description": "Escolha uma opção:",        // ← Texto da tela
  "choice": {
    "1": {
      "label": "Meus Jogos",                  // ← Texto da opção
      "goto": "@/jogos/lista.json"           // ← Navegação
    }
  }
}
```

## Exemplos de Personalização

### CLI Minimalista

```json
{
  "defaultCommand": "run",
  "commands": {
    "run": {"action": "load_program", "target": "program/initial/menu.json"}
  },
  "messages": {
    "starting": "Loading...",
    "error": "Error:"
  }
}
```

### CLI Elaborado

```json
{
  "defaultCommand": "iniciar",
  "commands": {
    "iniciar": {"action": "load_program", "target": "program/initial/menu.json"},
    "ajuda": {"action": "show_help"},
    "versao": {"action": "show_help"},
    "config": {"action": "load_program", "target": "program/config/main.json"}
  },
  "help": {
    "title": "🎮 Minha Plataforma Personalizada",
    "sections": [
      {"title": "Comandos:", "items": ["iniciar - Começar", "ajuda - Ajuda"]}
    ]
  }
}
```

## Vantagens do Sistema Agnóstico

### 🌍 **Internacionalização**
```
program/
├── cli/
│   ├── config.json     # Português
│   ├── config.en.json  # English  
│   └── config.es.json  # Español
```

### 🎨 **Temas e Estilos**
```json
{
  "messages": {
    "starting": "🎮 Iniciando...",      // Tema gamer
    "starting": "⚡ Carregando...",     // Tema tech
    "starting": "🌟 Bem-vindo..."      // Tema amigável
  }
}
```

### 🔧 **Diferentes Propósitos**
```json
// Para jogos infantis
{"defaultCommand": "brincar", "messages": {"starting": "🎈 Vamos brincar!"}}

// Para aplicações corporativas  
{"defaultCommand": "executar", "messages": {"starting": "📊 Iniciando sistema..."}}

// Para desenvolvimento
{"defaultCommand": "dev", "messages": {"starting": "💻 Developer mode..."}}
```

### 🚀 **Deployment Específico**
```json
// config.production.json
{
  "commands": {
    "start": {"action": "load_program", "target": "program/production/menu.json"}
  }
}

// config.development.json  
{
  "commands": {
    "start": {"action": "load_program", "target": "program/dev/menu.json"},
    "debug": {"action": "load_program", "target": "program/debug/menu.json"}
  }
}
```

## Fluxo Agnóstico Completo

1. **CLI carrega** `program/cli/config.json`
2. **Config define** comandos disponíveis e comportamento
3. **Engine carrega** `program/components/messages.json`
4. **Renderer usa** textos do JSON para interface
5. **Navegação segue** estrutura definida nos JSONs dos programas
6. **Jogos seguem** estrutura própria, também em JSON

**Resultado:** Zero hardcoding, 100% configurável via JSON!

O código é apenas o "motor" - todo o comportamento vem da "configuração" JSON.
