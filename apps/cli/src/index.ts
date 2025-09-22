#!/usr/bin/env node

const { VaudioEngine, KeyboardInputHandler, ConsoleRenderer } = require('@vaudio/components');
const path = require('path');
const fs = require('fs');

// Load app config
let config: any = {};
try {
    const configPath = path.resolve('./program/config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
} catch (error) {
    console.error('Error loading config:', error);
    process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || 'start';

async function main() {
    if (command === 'help') {
        // Load help program like any other program
        try {
            console.log(config.messages.starting);
            const basePath = path.resolve('.');
            console.log(config.messages.basePath.replace('{path}', basePath));
            console.log();

            const inputHandler = new KeyboardInputHandler();
            const renderer = new ConsoleRenderer();
            
            const engine = new VaudioEngine({
                basePath: basePath,
                renderer,
                inputHandler
            });

            // Initialize with help program instead of default menu
            await engine.initializeWithProgram('program/help/menu.json');
            
            console.log(config.messages.initialized);
            console.log();
            
            await engine.start();
            
        } catch (error) {
            console.error(config.messages.error, error);
            process.exit(1);
        }
    } else if (command === 'start') {
        // Start normally with default entry point
        try {
            console.log(config.messages.starting);
            const basePath = args[1] || '.';
            const resolvedBasePath = path.resolve(basePath);
            console.log(config.messages.basePath.replace('{path}', resolvedBasePath));
            console.log();

            const inputHandler = new KeyboardInputHandler();
            const renderer = new ConsoleRenderer();
            
            const engine = new VaudioEngine({
                basePath: resolvedBasePath,
                renderer,
                inputHandler
            });

            await engine.initialize();
            
            console.log(config.messages.initialized);
            console.log();
            
            await engine.start();
            
        } catch (error) {
            console.error(config.messages.error, error);
            process.exit(1);
        }
    } else {
        console.log(config.messages.unknownCommand);
    }
}

main();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n${config.messages.exiting}`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`\n${config.messages.exiting}`);
    process.exit(0);
});