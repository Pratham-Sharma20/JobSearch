import { RedisMemoryServer } from 'redis-memory-server';

async function bootstrap() {
  console.log('🚀 Starting local dev environment...');

  try {
    // Start Redis Memory Server
    const redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    
    process.env.REDIS_URL = `redis://${host}:${port}`;
    console.log(`✅ Local Redis server started at ${process.env.REDIS_URL}`);

    // Now dynamically import the main server so that it picks up the patched environment variables
    const { startServer } = await import('./server');
    await startServer();
  } catch (err) {
    console.error('Failed to start dev environment:', err);
    process.exit(1);
  }
}

bootstrap();
