import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎃 Halloween Personality Test Backend`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Email Auth: ${process.env.ENABLE_EMAIL_AUTH === 'true' ? 'Enabled' : 'Disabled'}`);
});
