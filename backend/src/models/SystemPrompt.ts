import { Pool } from 'pg';

export interface ISystemPrompt{
  uuid: string;
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
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_prompts (
          uuid UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
        'INSERT INTO system_prompts (uuid, name, content) VALUES ($1, $2, $3) RETURNING *',
        [prompt.uuid, prompt.name, prompt.content]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByUuid(uuid: string): Promise<ISystemPrompt | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'SELECT * FROM system_prompts WHERE uuid = $1',
        [uuid]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async update(uuid: string, data: { name: string; content: string }): Promise<ISystemPrompt> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ISystemPrompt>(
        'UPDATE system_prompts SET name = $1, content = $2 WHERE uuid = $3 RETURNING *',
        [data.name, data.content, uuid]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async delete(uuid: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM system_prompts WHERE uuid = $1',
        [uuid]
      );
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }
} 