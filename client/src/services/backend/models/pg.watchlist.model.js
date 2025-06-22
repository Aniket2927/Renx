module.exports = (sequelize, DataTypes) => {
  const Watchlist = sequelize.define("watchlist", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: 'Default'
    },
    symbols: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  return Watchlist;
}; 