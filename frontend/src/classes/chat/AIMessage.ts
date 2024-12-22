import { Message } from './Message';

export class AIMessage extends Message {
  isUser(): boolean {
    return false;
  }
}
