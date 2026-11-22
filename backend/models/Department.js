'use strict';

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'departments',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  Department.associate = (models) => {
    Department.hasMany(models.Subject, { foreignKey: 'department_id', as: 'subjects' });
  };

  return Department;
};
