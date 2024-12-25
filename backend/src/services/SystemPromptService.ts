import { SystemPrompt, type ISystemPrompt } from '../models/SystemPrompt';
import { v4 as uuidv4 } from 'uuid';

export class SystemPromptService {
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
      id: uuidv4(),
      name,
      content
    });
  }

  async updatePrompt(id: string, name: string, content: string): Promise<ISystemPrompt | null> {
    const existingPrompt = await SystemPrompt.findByUuid(id);
    if (!existingPrompt) return null;

    return await SystemPrompt.update(id, { name, content });
  }

  async getPromptByUuid(id: string): Promise<ISystemPrompt | null> {
    return await SystemPrompt.findByUuid(id);
  }

  async deletePrompt(id: string): Promise<boolean> {
    if (!id || id === 'undefined') {
        console.error('Invalid ID provided to SystemPromptService:', id);
        return false;
    }
    console.log('SystemPromptService attempting to delete ID:', id);
    return await SystemPrompt.delete(id);
  }
} 