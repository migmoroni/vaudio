# VAudio - Aplicação Multiplataforma

Aplicação de áudio multiplataforma com React Web, React Native Mobile e Tauri Desktop.

## 🚀 Estrutura do Projeto

```
vaudio/
├── apps/
│   ├── web/          # React + Vite
│   ├── mobile/       # React Native + Expo
│   └── desktop/      # Tauri + React
├── shared/           # Código compartilhado TypeScript
└── package.json      # Workspace pnpm
```

## 📋 Pré-requisitos

### 1. Instalar Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Download do site oficial: https://nodejs.org
```

### 2. Instalar pnpm
```bash
npm install -g pnpm
```

### 3. Instalar Rust (para Tauri)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 4. Instalar dependências do Tauri
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# macOS
xcode-select --install

# Windows
# Instalar Microsoft Visual Studio C++ Build Tools
```

### 5. Instalar React Native CLI e Expo
```bash
npm install -g @react-native-community/cli
npm install -g @expo/cli
```

## 🛠️ Configuração Inicial

### 1. Instalar dependências (TODAS as aplicações de uma vez)
```bash
pnpm install
```
☝️ **Este comando instala dependências para todos os projetos automaticamente!**

### 2. Verificar se tudo está funcionando
```bash
# Verifica tipos em todos os projetos
pnpm type-check

# Executa lint em todos os projetos  
pnpm lint
```

### 3. Para desenvolvimento rápido
```bash
# Inicia TODOS os projetos em paralelo
pnpm dev

# Ou individualmente:
pnpm dev:web     # Apenas web
pnpm dev:mobile  # Apenas mobile  
pnpm dev:desktop # Apenas desktop
```

## 🖥️ Desenvolvimento

### Web (React + Vite)
```bash
# Desenvolvimento
pnpm dev:web

# Build
pnpm build:web
```
Acesse: http://localhost:3000

### Mobile (React Native + Expo)
```bash
# Desenvolvimento
pnpm dev:mobile

# Para Android
pnpm --filter mobile android

# Para iOS
pnpm --filter mobile ios
```

### Desktop (Tauri)
```bash
# Desenvolvimento
pnpm dev:desktop

# Build
pnpm build:desktop
```

## 📱 Scripts Disponíveis

### 🚀 **Comandos Principais**
```bash
# Desenvolvimento
pnpm dev              # Inicia TODOS os projetos em paralelo
pnpm dev:web          # Apenas web (http://localhost:3000)
pnpm dev:mobile       # Apenas mobile (Expo)
pnpm dev:desktop      # Apenas desktop (Tauri)

# Build
pnpm build            # Constrói TODOS os projetos
pnpm build:web        # Build apenas web
pnpm build:mobile     # Build apenas mobile
pnpm build:desktop    # Build apenas desktop

# Utilitários
pnpm lint             # Lint em TODOS os projetos
pnpm lint:fix         # Corrige erros de lint automaticamente
pnpm type-check       # Verificação de tipos em TODOS
pnpm test             # Executa testes em TODOS
pnpm clean            # Remove node_modules de TODOS
pnpm clean:install    # Limpa tudo e reinstala
pnpm update:deps      # Atualiza dependências de TODOS
```

### 💡 **Vantagens do pnpm Workspaces**

✅ **Instalação única**: `pnpm install` instala dependências de todos os projetos  
✅ **Compartilhamento**: Dependências comuns são compartilhadas (economia de espaço)  
✅ **Performance**: Muito mais rápido que npm/yarn  
✅ **Comandos em paralelo**: Execute scripts em vários projetos simultaneamente  
✅ **Versionamento consistente**: Garante versões compatíveis entre projetos  
✅ **Gerenciamento centralizado**: Um `package-lock` para todos os projetos

## � **Fluxo de Trabalho Recomendado**

### **Primeira vez clonando o projeto:**
```bash
git clone <repo>
cd vaudio
pnpm install        # Instala TUDO automaticamente
pnpm type-check     # Verifica se está tudo ok
pnpm dev           # Inicia desenvolvimento
```

### **Desenvolvimento diário:**
```bash
# Opção 1: Tudo junto (recomendado)
pnpm dev

# Opção 2: Apenas uma plataforma
pnpm dev:web       # Para frontend web
pnpm dev:mobile    # Para mobile
pnpm dev:desktop   # Para desktop
```

### **Antes de fazer commit:**
```bash
pnpm lint:fix      # Corrige problemas automaticamente
pnpm type-check    # Verifica tipos
pnpm build         # Testa se tudo builda
```

### **Atualizando dependências:**
```bash
pnpm update:deps   # Atualiza todos os projetos
pnpm clean:install # Se houver problemas, limpa e reinstala
```

## �🔧 Configuração do Android (React Native)

1. Instalar Android Studio
2. Configurar Android SDK
3. Adicionar ao PATH:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🍎 Configuração do iOS (React Native)

1. Instalar Xcode (macOS)
2. Instalar CocoaPods:
```bash
sudo gem install cocoapods
```

## 📦 Tecnologias Utilizadas

- **Web**: React 18, Vite, TypeScript
- **Mobile**: React Native, Expo
- **Desktop**: Tauri, React, Rust
- **Shared**: TypeScript
- **Package Manager**: pnpm (workspaces)

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

✨ **VAudio** - Uma aplicação multiplataforma moderna!
