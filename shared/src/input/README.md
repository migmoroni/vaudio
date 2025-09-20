# VAudio Input System - Arquitetura Componentizada

## Visão Geral

O sistema de input da VAudio foi completamente refatorado para uma arquitetura modular e componentizada, onde cada tipo de dispositivo de entrada tem sua própria implementação especializada.

## Estrutura dos Componentes

### 📁 `/shared/src/input/`

```
input/
├── index.ts                    # Exports centralizados
├── InputProcessor.ts           # Processador principal (coordenador)
├── BaseInputDevice.ts          # Interface e classe base
├── KeyboardInputDevice.ts      # Dispositivo de teclado
├── MouseInputDevice.ts         # Dispositivo de mouse
├── GamepadInputDevice.ts       # Dispositivo de gamepad
├── TouchInputDevice.ts         # Dispositivo touch/tela sensível
└── VoiceInputDevice.ts         # Dispositivo de comandos de voz
```

## Componentes Especializados

### 🎯 **BaseInputDevice**
- **Responsabilidade**: Interface e implementação base comum
- **Funcionalidades**:
  - Gerenciamento de mapeamentos
  - Validação de entrada
  - Processamento de comandos
  - Debug info básico

### ⌨️ **KeyboardInputDevice**
- **Responsabilidade**: Processar entrada de teclado
- **Funcionalidades**:
  - Mapeamentos WASD, setas, numpad
  - Suporte a modificadores (Ctrl, Alt, Shift)
  - Mapeamentos personalizados
  - Teclas alternativas (Enter, Space, Esc)

### 🖱️ **MouseInputDevice**
- **Responsabilidade**: Processar entrada de mouse
- **Funcionalidades**:
  - Cliques (esquerdo, direito, meio)
  - Movimento com sensibilidade ajustável
  - Scroll wheel
  - Gestos direcionais baseados em movimento

### 🎮 **GamepadInputDevice**
- **Responsabilidade**: Processar entrada de gamepad/controle
- **Funcionalidades**:
  - Botões face (A, B, X, Y)
  - D-Pad direcional
  - Analógicos com dead zone configurável
  - Triggers e bumpers
  - Suporte Xbox/PlayStation

### 👆 **TouchInputDevice**
- **Responsabilidade**: Processar entrada touch/tela sensível
- **Funcionalidades**:
  - Taps em quadrantes da tela
  - Swipes direcionais
  - Multi-touch (2, 3+ dedos)
  - Gestos especiais (long press, pinch)
  - Coordenadas normalizadas

### 🎤 **VoiceInputDevice**
- **Responsabilidade**: Processar comandos de voz
- **Funcionalidades**:
  - Comandos em português e inglês
  - Sistema de sinônimos
  - Threshold de confiança
  - Normalização de texto (remove acentos)
  - Comandos direcionais e numéricos

### 🎛️ **InputProcessor**
- **Responsabilidade**: Coordenar todos os dispositivos
- **Funcionalidades**:
  - Gerenciar instâncias de dispositivos
  - Sistema de combinações de comandos
  - Timeout configurável
  - Debug consolidado

## Mapeamentos Padrão

### Comandos Universais
Todos os dispositivos mapeiam para os mesmos 4 comandos universais:
- **Comando 1**: Norte/Cima/Confirmar
- **Comando 2**: Leste/Direita/Próximo  
- **Comando 3**: Sul/Baixo/Cancelar
- **Comando 4**: Oeste/Esquerda/Anterior

### Exemplos de Mapeamento

#### Teclado:
```typescript
W, 1, ↑, Numpad8 → Comando 1
E, 2, →, Numpad6 → Comando 2
S, 3, ↓, Numpad2 → Comando 3
D, 4, ←, Numpad4 → Comando 4
```

#### Mouse:
```typescript
Botão Esquerdo (0) → Comando 1
Botão Direito (2) → Comando 2
Botão Meio (1) → Comando 3
Botão Voltar (3) → Comando 1
Botão Avançar (4) → Comando 2
Scroll Up/Down → Comando 1/3
```

**Suporte para Mouses de 5 Botões:**
- Botões padrão: Esquerdo, Meio, Direito
- Botões adicionais: Voltar (Back/Button 3), Avançar (Forward/Button 4)
- Totalmente compatível com mouses gaming

#### Gamepad:
```typescript
A, D-Pad ↑, Stick ↑ → Comando 1
B, D-Pad →, Stick → → Comando 2
X, D-Pad ↓, Stick ↓ → Comando 3
Y, D-Pad ←, Stick ← → Comando 4
```

#### Touch:
```typescript
Tap Quadrante Superior Esq. → Comando 1
Tap Quadrante Superior Dir. → Comando 2
Tap Quadrante Inferior Esq. → Comando 3
Tap Quadrante Inferior Dir. → Comando 4
```

#### Voz:
```typescript
"cima", "um", "confirmar" → Comando 1
"direita", "dois", "próximo" → Comando 2
"baixo", "três", "cancelar" → Comando 3
"esquerda", "quatro", "voltar" → Comando 4
```

## Como Usar

### Uso Básico:

```typescript
import { InputProcessor, KeyboardInputDevice } from 'shared/src/input';

// Criar processador
const inputProcessor = new InputProcessor();

// Processar entrada de teclado
const commands = inputProcessor.processKeyboardInput('w');
// Retorna: [{ command: [1], timestamp: ... }]
```

### Uso Avançado com Dispositivos Específicos:

```typescript
import { KeyboardInputDevice, MouseInputDevice } from 'shared/src/input';

// Criar dispositivo específico
const keyboard = new KeyboardInputDevice();
keyboard.addKeyMapping('space', 1, { ctrlKey: true });

const mouse = new MouseInputDevice();
mouse.setSensitivity(2.0);

// Processar entrada diretamente
const keyCommands = keyboard.processKeyboardInput('w');
const mouseCommands = mouse.processMouseClick(0, 100, 200);
```

### Configuração Personalizada:

```typescript
const processor = new InputProcessor({
  enableCombinations: true,
  combinationTimeout: 300,
  mappings: [
    { device: InputDevice.KEYBOARD, trigger: 'q', command: 1 },
    { device: InputDevice.VOICE, trigger: 'ação', command: 2 }
  ]
});
```

## Benefícios da Componentização

### ✅ **Especialização**
- Cada dispositivo tem lógica específica otimizada
- Suporte a recursos únicos (dead zone, sensibilidade, sinônimos)
- Validação adequada para cada tipo de entrada

### ✅ **Extensibilidade**
- Novos dispositivos podem ser adicionados facilmente
- Configurações específicas por dispositivo
- Mapeamentos personalizados sem afetar outros dispositivos

### ✅ **Manutenibilidade**
- Código organizado por responsabilidade
- Fácil debugging por dispositivo
- Testes isolados possíveis

### ✅ **Flexibilidade**
- Dispositivos podem ser usados independentemente
- Configuração granular por tipo de entrada
- Suporte simultâneo a múltiplos dispositivos

## Debug e Monitoramento

Cada dispositivo oferece informações de debug:

```typescript
// Info geral do processador
const debugInfo = inputProcessor.getDebugInfo();

// Info específica de um dispositivo
const keyboardDevice = inputProcessor.getDevice(InputDevice.KEYBOARD);
const keyboardInfo = keyboardDevice?.getDebugInfo();
```

## Compatibilidade

A refatoração mantém **100% de compatibilidade** com o código existente:
- Interface pública do `InputProcessor` preservada
- Todos os métodos continuam funcionando
- Sistema de comandos universais inalterado

## Próximos Passos

1. **Gesture Recognition**: Melhorar reconhecimento de gestos complexos
2. **Voice Training**: Sistema de treinamento para comandos de voz
3. **Adaptive Mappings**: Mapeamentos que se adaptam ao contexto
4. **Input Recording**: Sistema de gravação/replay de comandos
5. **Accessibility**: Melhor suporte para dispositivos de acessibilidade

---

*Esta arquitetura componentizada oferece uma base sólida e extensível para suporte a qualquer tipo de dispositivo de entrada, mantendo a simplicidade dos comandos universais.*
