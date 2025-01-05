import { Files, IUserFile } from '../models/Files';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class FileManagerService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.initializeUploadDir();
  }

  private async initializeUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  private async ensureUserDirectory(userId: string) {
    const userDir = path.join(this.uploadDir, userId);
    try {
      await fs.mkdir(userDir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory for user ${userId}:`, error);
    }
    return userDir;
  }

  async saveFile(file: Express.Multer.File, userId: string = '0'): Promise<IUserFile> {
    const userDir = await this.ensureUserDirectory(userId);
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const relativePath = path.join('uploads', userId, uniqueFilename);
    const fullPath = path.join(process.cwd(), relativePath);

    try {
      await fs.writeFile(fullPath, file.buffer);

      return await Files.create({
        user_id: userId,
        filename: uniqueFilename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        path: relativePath
      });
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async getUserFiles(userId: string = '0'): Promise<IUserFile[]> {
    return await Files.findByUserId(userId);
  }

  async getFileById(id: string): Promise<IUserFile | null> {
    return await Files.findById(id);
  }
}
