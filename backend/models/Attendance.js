'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'teachers', key: 'id' }
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    check_in_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    check_in_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    check_out_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    check_out_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    check_in_method: {
      type: DataTypes.ENUM('gps', 'qr', 'manual'),
      allowNull: true
    },
    check_out_method: {
      type: DataTypes.ENUM('gps', 'qr', 'manual'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'half_day', 'on_leave', 'early_leave', 'holiday'),
      allowNull: false,
      defaultValue: 'absent'
    },
    working_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    }
  }, {
    tableName: 'attendances',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['teacher_id', 'attendance_date']
      }
    ]
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    Attendance.belongsTo(models.User, { foreignKey: 'modified_by', as: 'modifier' });
  };

  return Attendance;
};
