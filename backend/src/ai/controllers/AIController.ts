import { Request, Response } from 'express';
import { AbstractAIService } from '../services/AbstractAIService';
import { SystemPromptService } from '../../services/SystemPromptService';
import { ChatHistoryService } from '../../services/ChatHistoryService';

export class AIController {
  private currentConversationId: string | null = null;

  constructor(
    private aiService: AbstractAIService,
    private systemPromptService: SystemPromptService,
    private chatHistoryService: ChatHistoryService
  ) {}

  getAllConversations = async (req: Request, res: Response) => {
    try {
      const conversations = await this.chatHistoryService.getAllConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({
        error: 'Błąd podczas pobierania konwersacji',
        details: error.message
      });
    }
  };

  getConversationById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.chatHistoryService.getConversationWithMessages(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Błąd podczas pobierania konwersacji',
        details: error.message
      });
    }
  };

  createConversation = async (req: Request, res: Response) => {
    try {
      const { name = 'Nowa konwersacja' } = req.body;
      const conversation = await this.chatHistoryService.createConversation(name);
      this.currentConversationId = conversation.id;
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({
        error: 'Błąd podczas tworzenia konwersacji',
        details: error.message
      });
    }
  };

  deleteConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await this.chatHistoryService.deleteConversation(id);
      if (!success) {
        return res.status(404).json({ error: 'Nie znaleziono konwersacji' });
      }
      if (this.currentConversationId === id) {
        this.currentConversationId = null;
      }
      res.json({ message: 'Konwersacja została usunięta' });
    } catch (error: any) {
      res.status(500).json({
        error: 'Błąd podczas usuwania konwersacji',
        details: error.message
      });
    }
  };

  updateConversationName = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nazwa jest wymagana' });
      }

      const conversation = await this.chatHistoryService.updateConversation(id, { name });
      
      if (!conversation) {
        return res.status(404).json({ error: 'Nie znaleziono konwersacji' });
      }

      // Zwracamy zaktualizowaną konwersację
      res.json(conversation);
    } catch (error: any) {
      console.error('Error updating conversation name:', error);
      res.status(500).json({
        error: 'Błąd podczas aktualizacji nazwy konwersacji',
        details: error.message
      });
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { systemPrompt, userPrompt, stream, conversationId } = req.body;

      if (!userPrompt) {
        return res.status(400).json({ error: 'User prompt is required' });
      }
      console.log('conversationId', conversationId);
      console.log('currentConversationId', this.currentConversationId);
      if (conversationId) {
        this.currentConversationId = conversationId;
      } else if (!this.currentConversationId) {
        const newConversation = await this.chatHistoryService.createConversation('Nowa konwersacja');
        this.currentConversationId = newConversation.id;
      }
      if (!this.currentConversationId) {
        throw new Error('Brak aktywnej konwersacji');
      }

      await this.chatHistoryService.addMessage(
        this.currentConversationId,
        'user',
        userPrompt
      );

      if (systemPrompt) {
        await this.chatHistoryService.addMessage(
          this.currentConversationId,
          'system',
          systemPrompt
        );
      }

      if (stream) {
        const streamResponse = await this.aiService.sendRequest({
          systemPrompt: systemPrompt || 'You are a helpful assistant.',
          userPrompt,
          stream: true
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        if (streamResponse && typeof streamResponse[Symbol.asyncIterator] === 'function') {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }

          if (this.currentConversationId) {
            await this.chatHistoryService.addMessage(
              this.currentConversationId,
              'assistant',
              fullResponse
            );
          }
        } else {
          throw new Error('Invalid stream response');
        }

        return res.end();
      }

      const response = await this.aiService.sendRequest({
        systemPrompt: systemPrompt || 'You are a helpful assistant.',
        userPrompt
      });

      if (this.currentConversationId) {
        await this.chatHistoryService.addMessage(
          this.currentConversationId,
          'assistant',
          response
        );
      }

      res.json({ response, conversationId: this.currentConversationId });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error processing AI request',
        details: error.message 
      });
    }
  };

  createEmbedding = async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      if (!this.aiService.createEmbedding) {
        return res.status(501).json({ error: 'Embedding creation not implemented' });
      }

      const embedding = await this.aiService.createEmbedding(text);
      res.json({ embedding });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error creating embedding',
        details: error.message 
      });
    }
  };

  updateSettings = async (req: Request, res: Response) => {
    try {
      const { model, temperature, maxTokens, debuggingMode } = req.body;

      if (model !== undefined) {
        this.aiService.setModel(model);
      }
      
      if (temperature !== undefined) {
        this.aiService.setTemperature(temperature);
      }
      
      if (maxTokens !== undefined) {
        this.aiService.setMaxTokens(maxTokens);
      }
      
      if (debuggingMode !== undefined) {
        this.aiService.setDebuggingMode(debuggingMode);
      }

      res.json({ 
        message: 'Settings updated successfully',
        currentSettings: this.aiService.getSettings()
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Error updating settings',
        details: error.message 
      });
    }
  };

  getSettings = async (req: Request, res: Response) => {
    try {
      res.json(this.aiService.getSettings());
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error getting settings',
        details: error.message 
      });
    }
  };

  getAllSystemPrompts = async (req: Request, res: Response) => {
    try {
      const prompts = await this.systemPromptService.getAllPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error fetching system prompts',
        details: error.message 
      });
    }
  };

  createSystemPrompt = async (req: Request, res: Response) => {
    try {
      const { name, content } = req.body;

      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      const prompt = await this.systemPromptService.createPrompt(name, content);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error creating system prompt',
        details: error.message 
      });
    }
  };

  updateSystemPrompt = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      const { name, content } = req.body;

      if (!uuid || !name || !content) {
        return res.status(400).json({ error: 'UUID, name and content are required' });
      }

      const prompt = await this.systemPromptService.updatePrompt(uuid, name, content);
      
      if (!prompt) {
        return res.status(404).json({ error: 'System prompt not found' });
      }

      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error updating system prompt',
        details: error.message 
      });
    }
  };

  deleteSystemPrompt = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      console.log('Request params:', req.params);
      console.log('Full request URL:', req.originalUrl);
      console.log('Attempting to delete prompt with ID:', uuid);

      if (!uuid || uuid === 'undefined') {
        console.error('Invalid UUID received:', uuid);
        return res.status(400).json({ error: 'Valid ID is required' });
      }

      const existingPrompt = await this.systemPromptService.getPromptByUuid(uuid);
      if (!existingPrompt) {
        console.log('Prompt not found with ID:', uuid);
        return res.status(404).json({ error: 'System prompt not found' });
      }

      const success = await this.systemPromptService.deletePrompt(uuid);
      console.log('Delete operation result:', success);

      if (!success) {
        return res.status(404).json({ error: 'System prompt not found' });
      }

      res.json({ message: 'System prompt deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting system prompt:', error);
      res.status(500).json({ 
        error: 'Error deleting system prompt',
        details: error.message 
      });
    }
  };
} 