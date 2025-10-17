import * as fs from 'fs/promises';
import * as path from 'path';

export class ConfigManager {
  private basePath: string;
  private messages: any = {};

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async loadMessages(): Promise<any> {
    try {
      const configPath = path.join(this.basePath, 'program/config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      this.messages = config.messages || {};
      return this.messages;
    } catch (error) {
      // Fallback to empty object if config can't be loaded
      this.messages = { engine: { errors: {}, info: {} } };
      return this.messages;
    }
  }

  getMessages(): any {
    return this.messages;
  }
}