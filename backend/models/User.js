'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher'),
      allowNull: false,
      defaultValue: 'teacher'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });

  User.associate = (models) => {
    User.hasOne(models.Teacher, { foreignKey: 'user_id', as: 'teacher' });
    User.hasOne(models.Admin, { foreignKey: 'user_id', as: 'admin' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
    User.hasMany(models.QrSession, { foreignKey: 'created_by', as: 'qrSessions' });
  };

  return User;
};
