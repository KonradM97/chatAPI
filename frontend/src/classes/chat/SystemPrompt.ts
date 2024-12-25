export class SystemPrompt {
  constructor(
    public content: string,
    public name: string,
    public id: string = '',
    public created_at: string = new Date().toISOString()
  ) {}
}
