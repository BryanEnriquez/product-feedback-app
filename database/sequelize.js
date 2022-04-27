const { Sequelize } = require('sequelize');

module.exports = new Sequelize(process.env.DATABASE_URL, {
  ...(process.env.NODE_ENV === 'production' && {
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  }),
});
