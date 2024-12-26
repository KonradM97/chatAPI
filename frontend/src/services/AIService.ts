import axios from 'axios';
import type { SystemPrompt } from '@/classes/chat/SystemPrompt';
import { chatHistoryService } from './ChatHistoryService';

interface ChatRequest {
  systemPrompt?: string;
  userPrompt: string;
  stream?: boolean;
  conversationId?: string;
}

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/ai`;
    console.log('API URL:', this.baseUrl);
  }

  async sendChatMessage(request: ChatRequest): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, request);
      return response.data.response;
    } catch (error: any) {
      console.error('Error sending chat message:', error);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  async getSystemPrompts(): Promise<SystemPrompt[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/prompts`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system prompts:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch system prompts');
    }
  }

  async createSystemPrompt(name: string, content: string): Promise<SystemPrompt> {
    try {
      const response = await axios.post(`${this.baseUrl}/prompts`, { name, content });
      return response.data;
    } catch (error: any) {
      console.error('Error creating system prompt:', error);
      throw new Error(error.response?.data?.error || 'Failed to create system prompt');
    }
  }

  async updateSystemPrompt(id: string, name: string, content: string): Promise<SystemPrompt> {
    try {
      console.log('Sending update request:', { id, name, content });
      const response = await axios.put(`${this.baseUrl}/prompts/${id}`, { name, content });
      return response.data;
    } catch (error: any) {
      console.error('Error updating system prompt:', error);
      throw new Error(error.response?.data?.error || 'Failed to update system prompt');
    }
  }

  async deleteSystemPrompt(id: string): Promise<void> {
    try {
      console.log('Attempting to delete prompt with ID:', id);
      const response = await axios.delete(`${this.baseUrl}/prompts/${id}`);
      console.log('Delete response:', response.data);
    } catch (error: any) {
      console.error('Error deleting system prompt:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete system prompt');
    }
  }

  async streamChatMessage(
    request: ChatRequest, 
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data.content);
            } catch (e) {
              console.warn('Failed to parse chunk:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error in stream:', error);
      throw new Error(
        error.message || 
        'Failed to connect to server. Please check your connection.'
      );
    }
  }
}

// Eksportujemy pojedynczą instancję
export const aiService = new AIService();
