const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbModulePath = path.join(__dirname, 'db.js');

function restoreEnv(originalEnv) {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
}

test('throws a clear error when database env vars are missing', () => {
  const originalEnv = { ...process.env };
  const dotenv = require('dotenv');
  const originalConfig = dotenv.config;

  try {
    for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
      delete process.env[key];
    }

    dotenv.config = () => ({ parsed: {} });
    delete require.cache[require.resolve(dbModulePath)];

    assert.throws(() => require(dbModulePath), /Missing required DB environment variables/);
  } finally {
    dotenv.config = originalConfig;
    restoreEnv(originalEnv);
    delete require.cache[require.resolve(dbModulePath)];
  }
});
