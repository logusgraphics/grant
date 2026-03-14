'use strict';

module.exports = {
  schema: './src/schemas/**/*.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL,
  },
  entities: {
    roles: true,
  },
  verbose: true,
  strict: true,
};
