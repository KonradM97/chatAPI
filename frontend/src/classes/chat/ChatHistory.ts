export class ChatHistory {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public status: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromJSON(json: any): ChatHistory {
    return new ChatHistory(
      json.id,
      json.user_id,
      json.name,
      json.status,
      new Date(json.created_at),
      new Date(json.updated_at)
    );
  }

  getFormattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFormattedUpdatedAt(): string {
    return this.updatedAt.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Metoda do aktualizacji nazwy
  updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  // Metoda do aktualizacji statusu
  updateStatus(newStatus: string): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  // Metoda do sprawdzania, czy konwersacja jest aktywna
  isActive(): boolean {
    return this.status === 'active';
  }

  // Metoda do konwersji do formatu JSON (przydatna przy wysyłaniu do API)
  toJSON(): object {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
}
