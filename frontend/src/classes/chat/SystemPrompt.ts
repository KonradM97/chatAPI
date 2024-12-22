export class SystemPrompt {
  constructor(
    public content: string,
    public name: string,
    public uuid: string = '',
    public created_at: string = new Date().toISOString()
  ) {}
}
