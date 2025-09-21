#!/usr/bin/env node

const { VaudioEngine, KeyboardInputHandler, ConsoleRenderer } = require('@vaudio/components');
const path = require('path');

// Simple command line argument parsing
const args = process.argv.slice(2);
const command = args[0] || 'start';
const basePath = args[1] || '.';

async function startVaudio(basePathArg: string) {
    try {
        console.log('🎮 Iniciando vaudio...');
        console.log(`Base path: ${basePathArg}`);
        console.log();

        // Resolve the base path
        const resolvedBasePath = path.resolve(basePathArg);
        
        // Create input handler and renderer
        const inputHandler = new KeyboardInputHandler();
        const renderer = new ConsoleRenderer();
        
        // Create and initialize engine
        const engine = new VaudioEngine({
            basePath: resolvedBasePath,
            renderer,
            inputHandler
        });

        await engine.initialize();
        
        console.log('✅ Engine inicializada com sucesso!');
        console.log();
        
        // Start the application
        await engine.start();
        
    } catch (error) {
        console.error('❌ Erro ao executar vaudio:', error);
        process.exit(1);
    }
}

function showHelp() {
    console.log('vaudio-cli - Plataforma de jogos de texto/audio');
    console.log();
    console.log('Comandos:');
    console.log('  start [base-path]    - Iniciar vaudio (padrão: pasta atual)');
    console.log('  help                 - Mostrar esta ajuda');
    console.log();
    console.log('Controles durante o uso:');
    console.log('  1-4: Escolhas diretas');
    console.log('  q (1+2): Menu/Submenu');
    console.log('  w (1+4): Informações');
    console.log('  e (2+3): [Reservado]');
    console.log('  r (3+4): Repetir/Voltar');
    console.log('  Ctrl+C: Sair');
}

// Handle commands
switch (command) {
    case 'start':
        startVaudio(basePath);
        break;
    case 'help':
    default:
        showHelp();
        break;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Saindo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Saindo...');
  process.exit(0);
});
