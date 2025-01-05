import axios from 'axios';

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

export class FileManagerService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/files`;
  }

  async uploadFile(file: File): Promise<IUserFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  }

  async getUserFiles(): Promise<IUserFile[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/files`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user files:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch files');
    }
  }

  async getFileById(id: string): Promise<IUserFile> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching file:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch file');
    }
  }
}

// Eksportujemy pojedynczą instancję serwisu
export const fileManagerService = new FileManagerService();
