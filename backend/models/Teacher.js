'use strict';

module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    teacher_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'teachers',
    timestamps: true,
    underscored: true
  });

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Teacher.hasMany(models.Attendance, { foreignKey: 'teacher_id', as: 'attendances' });
    Teacher.hasMany(models.LeaveRequest, { foreignKey: 'teacher_id', as: 'leaveRequests' });
  };

  return Teacher;
};
