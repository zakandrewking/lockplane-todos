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

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
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
