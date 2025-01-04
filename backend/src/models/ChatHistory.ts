import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface IConversation {
  id: string;
  user_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface IMessage {
  id: string;
  conversation_id: string | null;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
}

export class ChatHistory {
  private static pool: Pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  static async createTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Tworzenie tabeli conversations
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY,
            user_id VARCHAR(255) DEFAULT '0',
            name VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (error) {
        console.error('Error creating conversations table:', error);
        // Kontynuujemy wykonanie, bo błąd może oznaczać że tabela już istnieje
      }

      // Tworzenie tabeli messages
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY,
            conversation_id UUID NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
          );
        `);
      } catch (error) {
        console.error('Error creating messages table:', error);
      }
    } finally {
      client.release();
    }
  }

  // Metody dla konwersacji
  static async createConversation(data: Omit<IConversation, 'id' | 'created_at' | 'updated_at'>): Promise<IConversation> {
    const client = await this.pool.connect();
    try {
      const now = new Date().toISOString();
      const result = await client.query<IConversation>(
        'INSERT INTO conversations (id, user_id, name, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [uuidv4(), data.user_id, data.name, data.status, now, now]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllConversations(): Promise<IConversation[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IConversation>(
        'SELECT * FROM conversations ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getConversationById(id: string): Promise<IConversation | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IConversation>(
        'SELECT * FROM conversations WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Metody dla wiadomości
  static async addMessage(data: Omit<IMessage, 'id' | 'created_at'>): Promise<IMessage> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IMessage>(
        'INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [uuidv4(), data.conversation_id, data.role, data.content, new Date().toISOString()]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getMessagesByConversationId(conversationId: string): Promise<IMessage[]> {
    const client = await this.pool.connect();
    try {
      try {
        const result = await client.query<IMessage>(
          'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
          [conversationId]
        );
        return result.rows;
      } catch (error) {
        console.error('Error fetching messages for conversation:', error);
        throw error;
      }
    } finally {
      client.release();
    }
  }

  static async deleteConversation(id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM conversations WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  static async updateConversation(id: string, data: { name?: string }): Promise<IConversation | null> {
    const client = await this.pool.connect();
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let valueIndex = 1;

      if (data.name !== undefined) {
        updateFields.push(`name = $${valueIndex}`);
        values.push(data.name);
        valueIndex++;
      }

      if (updateFields.length === 0) {
        return null;
      }
      
      console.log( `UPDATE conversations 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${valueIndex} 
        RETURNING *`,
       values)
      values.push(id);
      const result = await client.query<IConversation>(
        `UPDATE conversations 
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${valueIndex} 
         RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}
