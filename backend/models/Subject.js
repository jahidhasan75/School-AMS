'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'departments', key: 'id' }
    }
  }, {
    tableName: 'subjects',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  Subject.associate = (models) => {
    Subject.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
  };

  return Subject;
};
