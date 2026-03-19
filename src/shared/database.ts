export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  poolSize: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'taskflow',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
};

export async function connectDatabase(): Promise<void> {
  // In real app: establish database connection with pool
  console.warn(`Connecting to database ${config.name} at ${config.host}:${config.port} (pool: ${config.poolSize})`);
}

export function getConfig(): DatabaseConfig {
  return config;
}
