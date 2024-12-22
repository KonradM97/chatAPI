import { Request, Response } from 'express';
import { AbstractAIService } from '../services/AbstractAIService';
import { SystemPromptService } from '../../services/SystemPromptService';

export class AIController {
  constructor(
    private aiService: AbstractAIService,
    private systemPromptService: SystemPromptService
  ) {}

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { systemPrompt, userPrompt, stream } = req.body;

      if (!userPrompt) {
        return res.status(400).json({ error: 'User prompt is required' });
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

        if (streamResponse && typeof streamResponse[Symbol.asyncIterator] === 'function') {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
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

      res.json({ response });
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

      if (!uuid) {
        return res.status(400).json({ error: 'UUID is required' });
      }

      const success = await this.systemPromptService.deletePrompt(uuid);
      
      if (!success) {
        return res.status(404).json({ error: 'System prompt not found' });
      }

      res.json({ message: 'System prompt deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error deleting system prompt',
        details: error.message 
      });
    }
  };
} 