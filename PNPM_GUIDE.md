# 🎯 Guia de Comandos pnpm Workspaces

## ✨ Comandos que demonstram o poder do pnpm

### 📦 **Instalação e Gerenciamento**
```bash
# Instala dependências de TODOS os projetos
pnpm install

# Adiciona dependência a projeto específico
pnpm --filter web add react-router-dom
pnpm --filter mobile add @react-navigation/native
pnpm --filter desktop add @tauri-apps/plugin-shell

# Adiciona dependência DEV a projeto específico  
pnpm --filter web add -D vitest
pnpm --filter shared add -D jest

# Remove dependência
pnpm --filter web remove react-router-dom

# Atualiza dependências de todos os projetos
pnpm -r update
```

### 🚀 **Execução Paralela**
```bash
# Executa script em TODOS os projetos simultaneamente
pnpm -r dev           # Inicia todos em dev mode
pnpm -r build         # Builda todos
pnpm -r lint          # Lint em todos
pnpm -r test          # Testa todos

# Execução em paralelo (mais rápido)
pnpm -r --parallel dev     # Inicia todos simultaneamente
pnpm -r --parallel build   # Builda todos em paralelo
```

### 🎯 **Filtragem Avançada**
```bash
# Executa apenas em apps (não no shared)
pnpm --filter "./apps/*" dev

# Executa em projetos que dependem do shared
pnpm --filter "...shared" type-check

# Executa em projetos específicos
pnpm --filter "{web,desktop}" build
pnpm --filter "!mobile" lint     # Todos exceto mobile
```

### 🔧 **Troubleshooting**
```bash
# Limpa node_modules de todos os projetos
pnpm -r exec rm -rf node_modules

# Reinstala tudo do zero
pnpm clean:install

# Verifica dependências
pnpm -r list

# Verifica dependências desatualizadas
pnpm -r outdated
```

### 💡 **Dicas Avançadas**
```bash
# Executa comando customizado em todos
pnpm -r exec echo "Processando: $(basename $PWD)"

# Instala dependência globalmente no workspace
pnpm add -w some-shared-tool

# Verifica quais projetos têm determinada dependência
pnpm -r list react

# Executa scripts em ordem específica (com dependências)
pnpm --filter "...desktop" build  # Builda shared primeiro, depois desktop
```

## 🎯 **Workflows Típicos**

### **Adicionando nova feature:**
```bash
# 1. Atualiza dependências se necessário
pnpm --filter web add nova-lib

# 2. Desenvolve com hot reload
pnpm dev:web

# 3. Testa integração
pnpm type-check
pnpm lint

# 4. Testa build
pnpm build:web
```

### **Trabalhando no código compartilhado:**
```bash
# 1. Inicia watch mode no shared
pnpm --filter shared dev

# 2. Em outro terminal, inicia apps que usam shared
pnpm dev:web
# ou
pnpm dev:desktop
```

### **Deploy/Release:**
```bash
# 1. Verifica tudo
pnpm type-check
pnpm lint

# 2. Builda tudo
pnpm build

# 3. Deploy específico
pnpm build:web     # para web
pnpm build:desktop # para desktop
```

## 🔥 **Vantagens vs npm/yarn**

| Recurso | npm | yarn | pnpm |
|---------|-----|------|------|
| Velocidade | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Espaço em disco | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Workspaces | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Filtragem | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Execução paralela | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Resultado**: pnpm economiza ~70% de espaço e é ~2x mais rápido!
