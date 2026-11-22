'use strict';

module.exports = (sequelize, DataTypes) => {
  const Holiday = sequelize.define('Holiday', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    }
  }, {
    tableName: 'holidays',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  return Holiday;
};
