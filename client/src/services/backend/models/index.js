const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: false
  }
);

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.users = require('./pg.user.model.js')(sequelize, DataTypes);
db.trades = require('./pg.trade.model.js')(sequelize, DataTypes);
db.orders = require('./pg.order.model.js')(sequelize, DataTypes);
db.watchlists = require('./pg.watchlist.model.js')(sequelize, DataTypes);

// Define relationships
db.users.hasMany(db.trades, { foreignKey: 'userId' });
db.trades.belongsTo(db.users, { foreignKey: 'userId' });

db.users.hasMany(db.orders, { foreignKey: 'userId' });
db.orders.belongsTo(db.users, { foreignKey: 'userId' });

db.users.hasOne(db.watchlists, { foreignKey: 'userId' });
db.watchlists.belongsTo(db.users, { foreignKey: 'userId' });

module.exports = db; 