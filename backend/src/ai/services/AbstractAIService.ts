import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface AIServiceOptions {
  model: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  debuggingMode?: boolean;
}

export interface RequestOptions {
  systemPrompt: string;
  userPrompt: string;
  stream?: boolean;
}

export interface ImageRequestOptions {
  imageUrl: string;
  userPrompt: string;
  systemPrompt?: string;
}

export abstract class AbstractAIService {
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;
  protected debuggingMode: boolean;
  protected apiKey?: string;

  constructor(options: AIServiceOptions) {
    this.model = options.model;
    this.temperature = options.temperature;
    this.maxTokens = options.maxTokens;
    this.debuggingMode = options.debuggingMode || false;
    this.apiKey = options.apiKey;
  }

  abstract sendRequest(options: RequestOptions): Promise<string | any>;
  
  abstract createEmbedding(text: string): Promise<number[]>;

  async createImage?(options: { prompt: string, size: string }): Promise<any> {
    throw new Error('Method not implemented');
  }

  async audioToText?(audioFilePath: string): Promise<string> {
    throw new Error('Method not implemented');
  }

  async readImage?(options: ImageRequestOptions): Promise<string> {
    throw new Error('Method not implemented');
  }

  protected formatMessages(systemPrompt: string, userPrompt: string): ChatCompletionMessageParam[] {
    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  }

  protected logDebug(message: string, data?: any): void {
    if (this.debuggingMode) {
      console.log(`[${this.model}] ${message}`, data || '');
    }
  }

  protected handleError(error: any, context: string): never {
    this.logDebug(`Error in ${context}:`, error);
    throw new Error(`${context}: ${error.message}`);
  }

  setModel(model: string): void {
    this.model = model;
    this.logDebug('Model changed to:', model);
  }

  setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
    this.temperature = temperature;
    this.logDebug('Temperature changed to:', temperature);
  }

  setMaxTokens(maxTokens: number): void {
    if (maxTokens < 1) {
      throw new Error('MaxTokens must be greater than 0');
    }
    this.maxTokens = maxTokens;
    this.logDebug('MaxTokens changed to:', maxTokens);
  }

  setDebuggingMode(debuggingMode: boolean): void {
    this.debuggingMode = debuggingMode;
    this.logDebug('DebuggingMode changed to:', debuggingMode);
  }

  getSettings(): AIServiceOptions {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      debuggingMode: this.debuggingMode
    };
  }
}
