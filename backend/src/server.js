

const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('BE is running');
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port : http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server');
  console.error(error);
  process.exit(1);
});
