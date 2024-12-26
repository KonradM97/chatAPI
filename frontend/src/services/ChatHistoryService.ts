import axios from 'axios';
import { ChatHistory } from '@/classes/chat/ChatHistory';
import { Message } from '@/classes/chat/Message';
import { UserMessage } from '@/classes/chat/UserMessage';
import { AIMessage } from '@/classes/chat/AIMessage';
import { SystemPrompt } from '@/classes/chat/SystemPrompt';

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
        // Dla wiadomości systemowych też używamy AIMessage
        return new AIMessage(message.id, message.content, timestamp, tempSystemPrompt);
      default:
        throw new Error(`Nieznana rola wiadomości: ${message.role}`);
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

  async getConversationById(id: string): Promise<{ conversation: ChatHistory; messages: Message[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations/${id}`);
      return {
        conversation: ChatHistory.fromJSON(response.data.conversation),
        messages: response.data.messages.map((msg: IMessage) => this.mapMessageToClass(msg))
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
