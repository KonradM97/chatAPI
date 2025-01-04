import axios from 'axios';
import { ChatHistory } from '@/classes/chat/ChatHistory';
import { Message } from '@/classes/chat/Message';
import { UserMessage } from '@/classes/chat/UserMessage';
import { AIMessage } from '@/classes/chat/AIMessage';
import { SystemPrompt } from '@/classes/chat/SystemPrompt';
import { SystemMessage } from '@/classes/chat/SystemMessage';
import { aiService } from '@/services/AIService';

interface IMessage {
  id: string;
  conversation_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
}

export class ChatHistoryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/ai`;
  }

  private mapMessageToClass(message: IMessage): Message {
    // Tworzymy tymczasowy SystemPrompt dla wiadomości
    const tempSystemPrompt = new SystemPrompt('', '');
    
    // Konwertujemy string daty na obiekt Date
    const timestamp = new Date(message.created_at);

    // Mapujemy wiadomość na odpowiednią klasę w zależności od roli
    switch (message.role) {
      case 'user':
        return new UserMessage(message.id, message.content, timestamp, tempSystemPrompt);
      case 'assistant':
        return new AIMessage(message.id, message.content, timestamp, tempSystemPrompt);
      case 'system':
        return new SystemMessage(message.id, message.content, timestamp, tempSystemPrompt);
      default:
        throw new Error(`Nieznana rola wiadomości: ${message.role}`);
    }
  }

  private async findOrCreateSystemPrompt(content: string): Promise<SystemPrompt> {
    try {
      // Pobierz wszystkie prompty
      const prompts = await aiService.getSystemPrompts();
      
      // Sprawdź czy już istnieje prompt o takiej treści
      const existingPrompt = prompts.find(p => p.content === content);
      if (existingPrompt) {
        return existingPrompt;
      }

      // Jeśli nie istnieje, stwórz nowy
      const name = await aiService.sendChatMessage({
        systemPrompt: 'Pomagasz w tworzeniu nazwy dla promptu systemowego. Nazwa ta musi być krótka i związana z tematem promptu. Napisz nazwę w jednym zdaniu.',
        userPrompt: `Oto system prompt: "${content}". Odpowiedz proszę tylko nazwą promptu.`
      });

      return await aiService.createSystemPrompt(name, content);
    } catch (error) {
      console.error('Error finding or creating system prompt:', error);
      // W przypadku błędu zwróć podstawowy prompt
      return new SystemPrompt(content, 'Tymczasowy prompt');
    }
  }

  async getAllConversations(): Promise<ChatHistory[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations`);
      return response.data.map((json: any) => ChatHistory.fromJSON(json));
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się pobrać historii konwersacji');
    }
  }

  async getConversationById(id: string): Promise<{ conversation: ChatHistory; messages: Message[]; systemPrompt: SystemPrompt }> {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations/${id}`);
      const messages = response.data.messages.map((msg: IMessage) => this.mapMessageToClass(msg));
      
      // Znajdź ostatni system prompt w wiadomościach
      const lastSystemMessage = [...messages]
        .reverse()
        .find(msg => msg instanceof SystemMessage) as SystemMessage | undefined;

      // Jeśli znaleziono system prompt, użyj go lub stwórz nowy
      const systemPrompt = lastSystemMessage 
        ? await this.findOrCreateSystemPrompt(lastSystemMessage.text)
        : new SystemPrompt('Jesteś pomocnym asystentem', 'Domyślny prompt');

      return {
        conversation: ChatHistory.fromJSON(response.data.conversation),
        messages,
        systemPrompt
      };
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się pobrać konwersacji');
    }
  }

  async createConversation(name: string = 'Nowa konwersacja'): Promise<ChatHistory> {
    try {
      const response = await axios.post(`${this.baseUrl}/conversations`, { name });
      return ChatHistory.fromJSON(response.data);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się utworzyć konwersacji');
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/conversations/${id}`);
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się usunąć konwersacji');
    }
  }

  async updateConversationName(id: string, name: string): Promise<ChatHistory> {
    try {
      const response = await axios.put(`${this.baseUrl}/conversations/${id}/name`, { name });
      return ChatHistory.fromJSON(response.data);
    } catch (error: any) {
      console.error('Error updating conversation name:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się zaktualizować nazwy konwersacji');
    }
  }

  // Metoda pomocnicza do pobierania wiadomości z konwersacji
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const { messages } = await this.getConversationById(conversationId);
      return messages;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw new Error(error.response?.data?.error || 'Nie udało się pobrać wiadomości');
    }
  }
}

// Eksportujemy pojedynczą instancję serwisu
export const chatHistoryService = new ChatHistoryService();
