import { Pool } from 'pg';

export interface ISystemPrompt{
  id: string;
  name: string;
  content: string;
  created_at: Date;
}

export class SystemPrompt{
  private static pool: Pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  static async createTable(): Promise<void> {
    const client = await this.pool.connect();
    try {
      console.log('CREATE DATABASE')
      await client.query(`
        DO $$ 
        BEGIN
            DROP TYPE IF EXISTS system_prompts CASCADE;
        EXCEPTION
            WHEN others THEN null;
        END $$;
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS system_prompts (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } finally {
      client.release();
    }
  }

  static async findAll(): Promise<ISystemPrompt[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'SELECT * FROM system_prompts ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async create(prompt: Omit<ISystemPrompt, 'created_at'>): Promise<ISystemPrompt> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'INSERT INTO system_prompts (id, name, content) VALUES ($1, $2, $3) RETURNING *',
        [prompt.id, prompt.name, prompt.content]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByUuid(id: string): Promise<ISystemPrompt | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'SELECT * FROM system_prompts WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async update(id: string, data: { name: string; content: string }): Promise<ISystemPrompt> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'UPDATE system_prompts SET name = $1, content = $2 WHERE id = $3 RETURNING *',
        [data.name, data.content, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (!id || id === 'undefined') {
        console.error('Invalid ID provided for deletion:', id);
        return false;
    }

    const client = await this.pool.connect();
    try {
        console.log('Attempting to delete prompt with ID:', id);
        const result = await client.query(
            'DELETE FROM system_prompts WHERE id = $1',
            [id]
        );
        console.log('Delete result:', result);
        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        console.error('Error in delete operation:', error);
        throw error;
    } finally {
        client.release();
    }
  }
} 