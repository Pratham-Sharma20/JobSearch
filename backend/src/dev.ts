async function bootstrap() {
  console.log('🚀 Starting local dev environment...');

  try {
    const { startServer } = await import('./server');
    await startServer();
  } catch (err) {
    console.error('Failed to start dev environment:', err);
    process.exit(1);
  }
}

bootstrap();
