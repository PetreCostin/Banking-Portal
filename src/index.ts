// Banking Portal - Main Entry Point
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Banking Portal API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Banking Portal server running on port ${PORT}`);
});

export default app;