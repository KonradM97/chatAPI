import { Message } from './Message';

export class UserMessage extends Message {
  isUser(): boolean {
    return true;
  }
}
