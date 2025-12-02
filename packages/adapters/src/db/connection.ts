/**
 * Database connection management
 */

import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

let db: Database | null = null;
let client: postgres.Sql | null = null;

export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  idleTimeout?: number;
  connectTimeout?: number;
}

/**
 * Initialize database connection
 */
export function initDatabase(config: DatabaseConfig): Database {
  if (db) {
    return db;
  }

  client = postgres(config.url, {
    max: config.maxConnections ?? 10,
    idle_timeout: config.idleTimeout ?? 20,
    connect_timeout: config.connectTimeout ?? 10,
  });

  db = drizzle(client, { schema });

  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return db !== null && client !== null;
}

/**
 * Health check - verify database is responding
 */
export async function healthCheck(): Promise<boolean> {
  if (!db || !client) {
    return false;
  }

  try {
    await client`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
