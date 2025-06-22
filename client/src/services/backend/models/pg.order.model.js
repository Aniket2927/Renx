module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("order", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['market', 'limit', 'stop', 'stop_limit']]
      }
    },
    side: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['buy', 'sell']]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    stopPrice: {
      type: DataTypes.DECIMAL(10, 2)
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'filled', 'partial', 'canceled', 'rejected']]
      }
    },
    filledQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    expiryDate: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true
  });

  return Order;
}; 