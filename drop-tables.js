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

// Parse DATABASE_URL to extract auth token if present
const databaseUrl = env.DATABASE_URL;
let url = databaseUrl;
let authToken;

try {
  const parsedUrl = new URL(databaseUrl);
  const tokenFromUrl = parsedUrl.searchParams.get('authToken');
  
  if (tokenFromUrl) {
    authToken = tokenFromUrl;
    parsedUrl.searchParams.delete('authToken');
    url = parsedUrl.toString();
  }
} catch (e) {
  // Not a valid URL (e.g., file:./todos.db), use as-is
}

const client = createClient({
  url,
  authToken
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
