import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { adminRouter } from './routes/admin.js';
import { downloadRouter } from './routes/download.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/admin', adminRouter);
app.use('/api/download', downloadRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`InterviewReady API running on port ${PORT}`);
});
