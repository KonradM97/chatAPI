import { v4 as uuidv4 } from 'uuid';
import { SystemPrompt, type ISystemPrompt } from '../models/SystemPrompt';

export class SystemPromptService{
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await SystemPrompt.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async getAllPrompts(): Promise<ISystemPrompt[]> {
    return await SystemPrompt.findAll();
  }

  async createPrompt(name: string, content: string): Promise<ISystemPrompt> {
    return await SystemPrompt.create({
      uuid: uuidv4(),
      name,
      content
    });
  }

  async updatePrompt(uuid: string, name: string, content: string): Promise<ISystemPrompt | null> {
    const existingPrompt = await SystemPrompt.findByUuid(uuid);
    if (!existingPrompt) return null;

    return await SystemPrompt.update(uuid, { name, content });
  }

  async getPromptByUuid(uuid: string): Promise<ISystemPrompt | null> {
    return await SystemPrompt.findByUuid(uuid);
  }

  async deletePrompt(uuid: string): Promise<boolean> {
    return await SystemPrompt.delete(uuid);
  }
} 