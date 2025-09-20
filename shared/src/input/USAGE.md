# Sistema de Comandos de Input

## 📋 **Visão Geral**

O sistema de input agora gera **8 comandos possíveis como strings**, que são interpretados pela engine baseado no contexto atual (menus, game, loja, editor).

## 🎮 **Comandos Disponíveis**

### **Comandos Individuais:**
- `"1"` - Comando básico 1
- `"2"` - Comando básico 2  
- `"3"` - Comando básico 3
- `"4"` - Comando básico 4

### **Comandos Combinados:**
- `"1+2"` - Combinação dos comandos 1 e 2
- `"1+4"` - Combinação dos comandos 1 e 4
- `"3+2"` - Combinação dos comandos 3 e 2
- `"3+4"` - Combinação dos comandos 3 e 4

## 🔧 **Como Usar**

### **1. Configuração Básica:**

```typescript
import { InputProcessor, CommandEvent } from 'vaudio-shared';

// Cria processador de input
const inputProcessor = new InputProcessor({
  enableCombinations: true,    // Permite combinações
  combinationTimeout: 500,     // 500ms para detectar combinações
  debugMode: true             // Logs de debug
});

// Registra callback para receber comandos
inputProcessor.onCommand((commandEvent: CommandEvent) => {
  console.log(`Comando recebido: ${commandEvent.command}`);
  console.log(`Dispositivo: ${commandEvent.device}`);
  
  // Aqui a engine interpreta o comando baseado no contexto
  handleGameCommand(commandEvent.command);
});
```

### **2. Processamento de Entradas:**

```typescript
// Entrada de teclado
inputProcessor.processKeyboardInput('w'); // Gera comando "1"
inputProcessor.processKeyboardInput('s'); // Gera comando "3"

// Entrada de mouse
inputProcessor.processMouseInput({ button: 0 }); // Botão esquerdo → "1"
inputProcessor.processMouseInput({ button: 2 }); // Botão direito → "2"

// Entrada de gamepad
inputProcessor.processGamepadInput({ button: 0 }); // A button → "1"
```

### **3. Combinações:**

```typescript
// Pressiona '1' e depois '2' rapidamente (< 500ms)
inputProcessor.processKeyboardInput('1'); 
inputProcessor.processKeyboardInput('2'); 
// Resultado: comando "1+2"

// Pressiona '3' e depois '4' rapidamente
inputProcessor.processKeyboardInput('3');
inputProcessor.processKeyboardInput('4');
// Resultado: comando "3+4"
```

### **4. Interpretação pela Engine:**

```typescript
function handleGameCommand(command: string) {
  // A engine interpreta baseado no contexto atual
  switch (currentContext) {
    case 'menu':
      handleMenuCommand(command);
      break;
    case 'game':
      handleGameplayCommand(command);
      break;
    case 'shop':
      handleShopCommand(command);
      break;
    case 'editor':
      handleEditorCommand(command);
      break;
  }
}

function handleMenuCommand(command: string) {
  switch (command) {
    case "1": navigateUp(); break;
    case "2": selectItem(); break;
    case "3": navigateDown(); break;
    case "4": goBack(); break;
    case "1+2": quickSelect(); break;
    case "3+4": exitMenu(); break;
    // etc...
  }
}

function handleGameplayCommand(command: string) {
  switch (command) {
    case "1": moveNorth(); break;
    case "2": moveEast(); break;
    case "3": moveSouth(); break;
    case "4": moveWest(); break;
    case "1+2": attackNorthEast(); break;
    case "3+4": defendSouthWest(); break;
    // etc...
  }
}
```

## 🎯 **Fluxo de Dados**

```
[Dispositivo Input] → [Device Processor] → [Command Processor] → [Engine]
     Mouse Click          MouseDevice         "1" or "1+2"         Game Logic
     Key Press           KeyboardDevice       String Command       Context Handler
     Gamepad Button      GamepadDevice        Combination          Menu/Game/Shop
```

## ⚙️ **Configuração de Mapeamentos**

```typescript
const customMappings = [
  // Teclado personalizado
  { device: InputDevice.KEYBOARD, trigger: 'space', command: 1 },
  { device: InputDevice.KEYBOARD, trigger: 'enter', command: 2 },
  
  // Mouse personalizado  
  { device: InputDevice.MOUSE, trigger: 'button0', command: 1 },
  { device: InputDevice.MOUSE, trigger: 'wheel', command: 3 }
];

const inputProcessor = new InputProcessor({
  mappings: customMappings,
  enableCombinations: true
});
```

## 🐛 **Debug e Monitoramento**

```typescript
// Informações de debug
const debugInfo = inputProcessor.getDebugInfo();
console.log('Estado do Input:', debugInfo);

// Forçar comando específico
inputProcessor.forceCommand("1+4");

// Cancelar combinação em andamento
inputProcessor.cancelCombination();
```

## 🔄 **Integração com Engine**

A engine recebe os comandos como strings e os interpreta através de **definições JSON** para diferentes contextos:

```json
{
  "menu": {
    "1": "navigate_up",
    "2": "select", 
    "3": "navigate_down",
    "4": "back",
    "1+2": "quick_select",
    "3+4": "exit"
  },
  "game": {
    "1": "move_north",
    "2": "move_east", 
    "3": "move_south",
    "4": "move_west",
    "1+2": "attack_diagonal_ne",
    "3+4": "defend_diagonal_sw"
  }
}
```

## ✅ **Benefícios**

- **Uniformidade**: Todas as entradas geram os mesmos 8 comandos
- **Flexibilidade**: Interpretação baseada em contexto
- **Extensibilidade**: Fácil adição de novos dispositivos
- **Combinações**: Suporte nativo para comandos complexos
- **Debug**: Sistema completo de monitoramento
