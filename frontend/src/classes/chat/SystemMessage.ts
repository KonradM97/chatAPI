import { Message } from './Message';

export class SystemMessage extends Message {
  isUser(): boolean {
    return false;
  }

  isSystem(): boolean {
    return true;
  }
} 