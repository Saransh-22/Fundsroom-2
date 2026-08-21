import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import runMigrations from './migrate.js';
import seedDatabase from './seed.js';

const parseDatabaseUrl = (url: string) => {
  const urlObj = new URL(url);
  const username = urlObj.username;
  const password = urlObj.password;
  const hostname = urlObj.hostname;
  const port = urlObj.port;
  const pathname = urlObj.pathname; // e.g., '/mini_erp'
  const database = pathname.substring(1); // remove leading slash
  return { username, password, hostname, port, database };
};

async function createDatabaseIfNotExists() {
  console.log('Creating admin pool');
  const { username, password, hostname, port, database } = parseDatabaseUrl(process.env.DATABASE_URL || '');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  // Connect to the default postgres database to create our database
  const adminPool = new Pool({
    user: username,
    host: hostname,
    database: 'postgres', // connect to the default database
    password,
    port: Number(port),
  });

  console.log('Connecting to admin pool');
  const client = await adminPool.connect();
  console.log('Connected to admin pool');
  try {
    // Check if the database exists
    console.log('Checking if database exists');
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database]
    );
    console.log('Database check result:', result.rowCount);

    if (result.rowCount === 0) {
      // Database does not exist, create it
      console.log('Database does not exist, creating it');
      await client.query(`CREATE DATABASE "${database}"`);
      console.log(`Database "${database}" created successfully`);
    } else {
      console.log(`Database "${database}" already exists`);
    }
  } catch (error) {
    console.error('Error checking/creating database:', error);
    throw error;
  } finally {
    console.log('Releasing client and ending admin pool');
    client.release();
    await adminPool.end();
  }
}

async function setupDatabase() {
  try {
    console.log('About to create database if not exists');
    await createDatabaseIfNotExists();
    console.log('Finished creating database if not exists');
    console.log('Running migrations...');
    await runMigrations();
    console.log('Migrations finished');
    console.log('Running seed...');
    await seedDatabase();
    console.log('Seed finished');
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
const isDirectCall = __filename === process.argv[1];
if (isDirectCall) {
  setupDatabase();
}

export default setupDatabase;