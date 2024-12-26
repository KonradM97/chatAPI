import express from 'express';
import { AbstractAIService } from './AbstractAIService';
import { AIController } from '../controllers/AIController';
import { SystemPromptService } from '../../services/SystemPromptService';
import { ChatHistoryService } from '../../services/ChatHistoryService';

export class AIRouter {
  private router: express.Router;
  private controller: AIController;

  constructor(aiService: AbstractAIService) {
    this.router = express.Router();
    const systemPromptService = new SystemPromptService();
    const chatHistoryService = new ChatHistoryService();
    this.controller = new AIController(aiService, systemPromptService, chatHistoryService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/chat', this.controller.sendMessage);
    this.router.post('/embedding', this.controller.createEmbedding);
    this.router.post('/settings', this.controller.updateSettings);
    this.router.get('/settings', this.controller.getSettings);

    // System Prompt routes
    this.router.get('/prompts', this.controller.getAllSystemPrompts);
    this.router.post('/prompts', this.controller.createSystemPrompt);
    this.router.put('/prompts/:uuid', this.controller.updateSystemPrompt);
    this.router.delete('/prompts/:uuid', this.controller.deleteSystemPrompt);

    // Nowe routy dla historii czatu
    this.router.get('/conversations', this.controller.getAllConversations);
    this.router.get('/conversations/:id', this.controller.getConversationById);
    this.router.post('/conversations', this.controller.createConversation);
    this.router.delete('/conversations/:id', this.controller.deleteConversation);
    this.router.put('/conversations/:id/name', this.controller.updateConversationName);
  }

  getRouter() {
    return this.router;
  }
}
