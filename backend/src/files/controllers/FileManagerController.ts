import { Request, Response } from 'express';
import { FileManagerService } from '../services/FileManagerService';

export class FileManagerController {
  constructor(private fileManagerService: FileManagerService) {}

  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const file = await this.fileManagerService.saveFile(req.file);
      res.json(file);
    } catch (error: any) {
      res.status(500).json({
        error: 'Error uploading file',
        details: error.message
      });
    }
  };

  getUserFiles = async (req: Request, res: Response) => {
    try {
      const files = await this.fileManagerService.getUserFiles();
      res.json(files);
    } catch (error: any) {
      res.status(500).json({
        error: 'Error fetching user files',
        details: error.message
      });
    }
  };

  getFileById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = await this.fileManagerService.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json(file);
    } catch (error: any) {
      res.status(500).json({
        error: 'Error fetching file',
        details: error.message
      });
    }
  };
}
