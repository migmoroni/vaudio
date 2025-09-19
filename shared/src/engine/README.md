# VAudio Game Engine - Arquitetura Componentizada

## Visão Geral

A VAudio Game Engine foi refatorada para uma arquitetura modular e componizada, facilitando a manutenção e extensibilidade do código.

## Estrutura dos Componentes

### 📁 `/shared/src/engine/`

```
engine/
├── index.ts              # Exports centralizados
├── VGameEngine.ts        # Engine principal (coordenador)
├── EventManager.ts       # Gerenciamento de eventos
├── SceneManager.ts       # Gerenciamento de cenas
├── ActionManager.ts      # Gerenciamento de ações
└── StateManager.ts       # Gerenciamento de estado
```

## Componentes Especializados

### 🎯 **EventManager**
- **Responsabilidade**: Gerenciar sistema de eventos
- **Funcionalidades**:
  - Adicionar/remover listeners
  - Emitir eventos
  - Controlar tipos de eventos

### 🎭 **SceneManager**
- **Responsabilidade**: Gerenciar cenas do jogo
- **Funcionalidades**:
  - Registrar/remover cenas
  - Trocar entre cenas
  - Executar callbacks de entrada/saída
  - Renderizar conteúdo de cenas

### ⚡ **ActionManager**
- **Responsabilidade**: Gerenciar ações globais
- **Funcionalidades**:
  - Registrar/remover ações
  - Executar ações por comando
  - Buscar ações disponíveis
  - Ações padrão do sistema (help, status)

### 💾 **StateManager**
- **Responsabilidade**: Gerenciar estado do jogo
- **Funcionalidades**:
  - Atualizar estado
  - Gerenciar variáveis
  - Controlar histórico
  - Gerenciar dados do jogador

### 🎮 **VGameEngine**
- **Responsabilidade**: Coordenar todos os managers
- **Funcionalidades**:
  - Inicializar/parar engine
  - Processar comandos universais
  - Coordenar comunicação entre componentes
  - Fornecer interface unificada

## Benefícios da Componentização

### ✅ **Facilidade de Manutenção**
- Cada componente tem responsabilidade única
- Código mais organizado e legível
- Facilita debugging e testing

### ✅ **Extensibilidade**
- Novos managers podem ser adicionados facilmente
- Componentes podem ser substituídos independentemente
- Funcionalidades podem ser expandidas sem afetar outros componentes

### ✅ **Reutilização**
- Managers podem ser usados independentemente
- Componentes têm interfaces bem definidas
- Facilita criação de diferentes tipos de jogos

### ✅ **Testabilidade**
- Cada componente pode ser testado isoladamente
- Dependências são injetadas claramente
- Mocking e stubbing são mais fáceis

## Sistema de Comandos Universais

A engine continua agnóstica ao tipo de input, processando apenas comandos universais `[1]`, `[2]`, `[3]`, `[4]` e suas combinações.

### Fluxo de Comando:
1. **Input Processor** → Converte input físico em comandos universais
2. **VGameEngine** → Recebe comando universal
3. **ActionManager** → Busca ação global correspondente
4. **SceneManager** → Verifica escolhas da cena atual
5. **EventManager** → Emite eventos de execução
6. **StateManager** → Atualiza estado conforme necessário

## Como Usar os Componentes

### Exemplo de Uso Individual:

```typescript
import { EventManager, StateManager, SceneManager } from 'shared/src/engine';

// Usar EventManager independentemente
const eventManager = new EventManager();
eventManager.on('custom_event', (event) => {
  console.log('Evento recebido:', event);
});

// Usar StateManager independentemente
const stateManager = new StateManager(eventManager);
stateManager.setVariable('playerName', 'Miguel');
```

### Exemplo de Extensão:

```typescript
// Criar um novo manager especializado
export class AudioManager {
  private eventManager: EventManager;
  
  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
  }
  
  // Implementar funcionalidades específicas de áudio
}
```

## Compatibilidade

A refatoração mantém **100% de compatibilidade** com o código existente:
- Interface pública da `VGameEngine` permanece idêntica
- Todos os tipos e contratos são preservados
- Aplicações existentes continuam funcionando sem modificações

## Próximos Passos

1. **AudioManager**: Implementar gerenciamento especializado de áudio
2. **SaveManager**: Adicionar sistema de save/load
3. **UIManager**: Gerenciar interfaces visuais
4. **NetworkManager**: Suporte a jogos online

---

*Esta arquitetura componentizada fornece uma base sólida e extensível para o desenvolvimento contínuo da VAudio Game Engine.*
