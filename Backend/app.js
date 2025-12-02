const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./config/dbConfig.js');
const models = require('./models/index.js'); 
const routes = require('./routes/index.js');
const dotenv = require('dotenv');
const logger =require('./utils/logger.js');
// ensure the email listener is registered at startup
require('./utils/sendMail');
const app = express();
app.use(bodyParser.json());
// enable CORS for frontend requests (configure origin as needed)
app.use(cors());

// attach standardized response helpers (res.sendResponse / res.sendError)
app.use(require('./middleware/responseMiddleware'));

dotenv.config();
app.use('/api/v1', routes);
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});


const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection established');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
};

start();
