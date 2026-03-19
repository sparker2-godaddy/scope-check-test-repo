import express from 'express';
import { authRoutes } from './auth/routes';
import { taskRoutes } from './tasks/routes';
import { userRoutes } from './users/routes';
import { errorHandler } from './shared/errors';
import { connectDatabase } from './shared/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(PORT, () => {
    console.warn(`TaskFlow API running on port ${PORT}`);
  });
}

start();

export { app };
