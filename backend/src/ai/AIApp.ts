import express from 'express';
import { AIRouter } from './routers/AIRouter';
import { OpenAIService } from './services/openAI/OpenAIService';
import { AbstractAIService } from './services/AbstractAIService';
import { OpenAITextModel }  from './services/openAI/OpenAIModels';

export class AIApp {
  private app: express.Application;
  private aiRouter: AIRouter;
  private aiService: AbstractAIService;

  constructor() {
    this.app = express();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    // Inicjalizacja serwisu AI (na razie tylko OpenAI)
    this.aiService = new OpenAIService({
      model: OpenAITextModel.GPT_4O,
      apiKey: apiKey,
      temperature: 0.7,
      maxTokens: 2000,
      debuggingMode: false,
    });

    // Inicjalizacja routera z wybranym serwisem
    this.aiRouter = new AIRouter(this.aiService);
  }

  getRouter() {
    return this.aiRouter.getRouter();
  }

  getService() {
    return this.aiService;
  }
}
