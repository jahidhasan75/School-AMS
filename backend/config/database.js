require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

// In production, require explicit database host and credentials
if (isProduction && (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER)) {
  console.warn('⚠️ WARNING: DB_HOST, DB_NAME, or DB_USER is not defined in production environment.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || (isProduction ? undefined : 'school_ams'),
  process.env.DB_USER || (isProduction ? undefined : 'root'),
  process.env.DB_PASS !== undefined ? process.env.DB_PASS : (isProduction ? undefined : ''),
  {
    host: process.env.DB_HOST || (isProduction ? undefined : 'localhost'),
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

module.exports = sequelize;
