import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface IUserFile {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  created_at: string;
}

export class Files {
  private static pool: Pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  static async createTable(): Promise<void> {
    const client = await this.pool.connect();
    try {
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_files (
            id UUID PRIMARY KEY,
            user_id VARCHAR(255) DEFAULT '0',
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(255) NOT NULL,
            size BIGINT NOT NULL,
            path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (error) {
        console.error('Error creating user_files table:', error);
      }
    } finally {
      client.release();
    }
  }

  static async create(data: Omit<IUserFile, 'id' | 'created_at'>): Promise<IUserFile> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IUserFile>(
        'INSERT INTO user_files (id, user_id, filename, original_name, mime_type, size, path, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [uuidv4(), data.user_id, data.filename, data.original_name, data.mime_type, data.size, data.path, new Date().toISOString()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating file record:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId: string): Promise<IUserFile[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IUserFile>(
        'SELECT * FROM user_files WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<IUserFile | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<IUserFile>(
        'SELECT * FROM user_files WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}
