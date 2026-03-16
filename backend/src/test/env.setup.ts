// Set required env vars before any imports run in tests
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.NODE_ENV = "test";
