import { ChatHistory, IConversation, IMessage } from '../models/ChatHistory';

export class ChatHistoryService {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await ChatHistory.createTables();
    } catch (error) {
      console.error('Error initializing chat history tables:', error);
    }
  }

  async createConversation(name: string, userId: string = '0', status: string = 'active'): Promise<IConversation> {
    return await ChatHistory.createConversation({
      user_id: userId,
      name,
      status
    });
  }

  async getAllConversations(): Promise<IConversation[]> {
    return await ChatHistory.getAllConversations();
  }

  async getConversationById(id: string): Promise<IConversation | null> {
    return await ChatHistory.getConversationById(id);
  }

  async addMessage(conversationId: string, role: 'system' | 'user' | 'assistant', content: string): Promise<IMessage> {
    return await ChatHistory.addMessage({
      conversation_id: conversationId,
      role,
      content
    });
  }

  async getMessagesByConversationId(conversationId: string): Promise<IMessage[]> {
    return await ChatHistory.getMessagesByConversationId(conversationId);
  }

  async deleteConversation(id: string): Promise<boolean> {
    return await ChatHistory.deleteConversation(id);
  }

  async updateConversation(id: string, data: { name?: string }): Promise<IConversation | null> {
    return await ChatHistory.updateConversation(id, data);
  }

  async getConversationWithMessages(id: string): Promise<{ conversation: IConversation, messages: IMessage[] }> {
    const conversation = await ChatHistory.getConversationById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const messages = await ChatHistory.getMessagesByConversationId(id);
    return {
      conversation,
      messages
    };
  }
}
