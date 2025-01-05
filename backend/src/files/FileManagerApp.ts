import express from 'express';
import multer from 'multer';
import { FileManagerService } from './services/FileManagerService';
import { FileManagerController } from './controllers/FileManagerController';
import { Files } from './models/Files';

export class FileManagerApp {
  private app: express.Application;
  private fileManagerService: FileManagerService;
  private fileManagerController: FileManagerController;
  private upload: multer.Multer;

  constructor() {
    this.app = express();
    
    // Inicjalizacja multer do obsługi plików
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });

    // Inicjalizacja serwisów i kontrolerów
    this.fileManagerService = new FileManagerService();
    this.fileManagerController = new FileManagerController(this.fileManagerService);

    // Inicjalizacja bazy danych
    this.initializeDatabase();
    
    // Inicjalizacja routów
    this.initializeRoutes();
  }

  private async initializeDatabase() {
    try {
      await Files.createTable();
      console.log('Files table initialized successfully');
    } catch (error) {
      console.error('Error initializing files table:', error);
    }
  }

  private initializeRoutes() {
    const router = express.Router();

    router.post('/upload', this.upload.single('file'), this.fileManagerController.uploadFile);
    router.get('/files', this.fileManagerController.getUserFiles);
    router.get('/files/:id', this.fileManagerController.getFileById);

    this.app.use('/api/files', router);
  }

  getRouter() {
    return this.app;
  }

  getService() {
    return this.fileManagerService;
  }
}
