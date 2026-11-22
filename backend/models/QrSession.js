'use strict';

module.exports = (sequelize, DataTypes) => {
  const QrSession = sequelize.define('QrSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    }
  }, {
    tableName: 'qr_sessions',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  QrSession.associate = (models) => {
    QrSession.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return QrSession;
};
