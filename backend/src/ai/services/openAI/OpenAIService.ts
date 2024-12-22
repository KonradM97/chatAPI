import OpenAI from 'openai';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources/chat/completions';
import { AbstractAIService, type RequestOptions, type ImageRequestOptions } from "../AbstractAIService";
import type { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import type { ImagesResponse } from "openai/resources/images";
import * as fs from 'fs';
import * as path from 'path';

export enum ImageSize {
  SMALL = "1024x1024",
  MEDIUM = "1792x1024",
  LARGE = "1024x1792"
}

export class OpenAIService extends AbstractAIService {
  private openai: OpenAI;

  constructor(options: {
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
    debuggingMode?: boolean;
  }) {
    super(options);
    this.openai = new OpenAI({
      apiKey: this.apiKey
    });
  }

  async sendRequest(options: RequestOptions): Promise<string | any> {
    try {
      const messages = this.formatMessages(options.systemPrompt, options.userPrompt);
      
      if (options.stream) {
        return await this.openai.chat.completions.create({
          messages,
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: true
        });
      }

      const completion = await this.openai.chat.completions.create({
        messages,
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      }) as ChatCompletion;

      if (completion.choices[0].message?.content) {
        return completion.choices[0].message.content;
      }
      
      throw new Error("Unexpected response format");
    } catch (error) {
      return this.handleError(error, "OpenAI completion");
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response: CreateEmbeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      return this.handleError(error, "Creating embedding");
    }
  }

  async createImage(options: { prompt: string; size: ImageSize }): Promise<ImagesResponse> {
    try {
      return await this.openai.images.generate({
        model: "dall-e-3",
        prompt: options.prompt,
        size: options.size,
      });
    } catch (error) {
      return this.handleError(error, "Image generation");
    }
  }

  async audioToText(audioFilePath: string): Promise<string> {
    try {
      const audioFile = fs.createReadStream(audioFilePath);
      const transcription = await this.openai.audio.transcriptions.create({
        model: "whisper-1",
        file: audioFile
      });
      return transcription.text;
    } catch (error) {
      return this.handleError(error, "Audio transcription");
    }
  }

  async readImage(options: ImageRequestOptions): Promise<string> {
    try {
      const base64Image = this.convertLocalImageToBase64(options.imageUrl);
      this.logDebug('Processing image', base64Image);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: options.userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: this.maxTokens,
      });

      if (response.choices[0].message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error("Unexpected response format");
    } catch (error) {
      return this.handleError(error, "Image analysis");
    }
  }

  private convertLocalImageToBase64(imagePath: string): string {
    try {
      this.logDebug('Converting image to base64', imagePath);
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const fileExtension = path.extname(imagePath).toLowerCase().slice(1) || 'png';
      const mimeType = `image/${fileExtension}`;
      return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
      return this.handleError(error, "Image conversion");
    }
  }
}
