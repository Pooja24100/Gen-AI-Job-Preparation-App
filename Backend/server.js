require('dotenv').config();

const app = require('./src/app');
const connectToDB = require('./src/config/database');

async function startServer() {
  try {
    await connectToDB();

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Server startup failed because the database is unavailable.');
    process.exit(1);
  }
}

startServer();
