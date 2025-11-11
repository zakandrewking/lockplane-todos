const { createClient } = require('@libsql/client');
const fs = require('fs');

// Read .env.local file
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

// Support SQLITE_DB_PATH (plain file path) or DATABASE_URL (full URL)
let url;
if (env.SQLITE_DB_PATH) {
  url = `file:${env.SQLITE_DB_PATH}`;
} else if (env.DATABASE_URL) {
  url = env.DATABASE_URL;
} else {
  console.error('❌ Error: Either SQLITE_DB_PATH or DATABASE_URL must be set');
  process.exit(1);
}

const client = createClient({
  url,
  authToken: env.LIBSQL_DB_TOKEN
});

(async () => {
  try {
    await client.execute('DROP TABLE IF EXISTS todos');
    console.log('✓ Dropped todos table');
    await client.execute('DROP TABLE IF EXISTS projects');
    console.log('✓ Dropped projects table');
    console.log('\n✅ Ready for Lockplane to create fresh schema');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
