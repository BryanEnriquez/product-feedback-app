import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  ...(process.env.NODE_ENV === 'production' && {
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  }),
});

export default sequelize;
