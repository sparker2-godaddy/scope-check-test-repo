export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'taskflow',
};

export async function connectDatabase(): Promise<void> {
  // In real app: establish database connection
  console.warn(`Connecting to database ${config.name} at ${config.host}:${config.port}`);
  // Fix: add connection timeout
  return new Promise((resolve) => setTimeout(resolve, 100));
}

export function getConfig(): DatabaseConfig {
  return { ...config };
}
