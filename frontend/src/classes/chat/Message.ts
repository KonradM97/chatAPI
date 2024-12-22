import { SystemPrompt } from './SystemPrompt';

export abstract class Message {
  constructor(
    public id: number,
    public text: string,
    public timestamp: Date,
    public systemPrompt: SystemPrompt
  ) {}

  getFormattedTime(): string {
    return this.timestamp.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFormattedDate(): string {
    return this.timestamp.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  abstract isUser(): boolean;
}
