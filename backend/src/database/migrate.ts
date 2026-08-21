import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connection.js';

async function runMigrations() {
  const client = await pool.connect();
  try {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const compiledMigrations = path.resolve(currentDirectory, 'migrations');
    const sourceMigrations = path.resolve(process.cwd(), 'src', 'database', 'migrations');
    const migratePath = fs.existsSync(compiledMigrations) ? compiledMigrations : sourceMigrations;
    const files = fs.readdirSync(migratePath).filter(file => file.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migratePath, file), 'utf8');
      await client.query(sql);
    }
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

const isDirectCall = import.meta.url === `file://${process.argv[1]}`;
if (isDirectCall) {
  runMigrations()
    .then(() => {
      console.log('Migration process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
