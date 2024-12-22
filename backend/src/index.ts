import * as express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import { AIApp } from './ai/AIApp';
import { SystemPrompt } from './models/SystemPrompt';

// Załaduj zmienne środowiskowe
dotenv.config();

const app = express.default();
const port = process.env.BACKEND_PORT || 4000;

// Konfiguracja połączenia z bazą danych
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Inicjalizacja bazy danych
async function initializeDatabase() {
  try {
    await SystemPrompt.createTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
}

// Konfiguracja CORS z opcjami
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

const aiApp = new AIApp();
app.use('/api/ai', aiApp.getRouter());

app.get('/', (req, res) => {
  res.json({ 
    message: 'API działa!',
    dbUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Połączenie z backendem działa!' });
});

// Nowy endpoint testujący połączenie z bazą
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      res.json({ 
        message: 'Połączenie z bazą działa!',
        timestamp: result.rows[0].now
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Błąd połączenia z bazą:', err);
    res.status(500).json({ 
      message: 'Błąd połączenia z bazą danych',
      error: err.message
    });
  }
});

// Inicjalizacja bazy danych przed uruchomieniem serwera
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
    console.log(`Środowisko: ${process.env.NODE_ENV}`);
    console.log(`URL bazy danych: ${process.env.DATABASE_URL}`);
  });
}); 