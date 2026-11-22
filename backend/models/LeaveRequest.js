'use strict';

module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define('LeaveRequest', {
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
    leave_type: {
      type: DataTypes.ENUM('casual', 'sick', 'emergency', 'personal', 'annual'),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    document_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    admin_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'leave_requests',
    timestamps: true,
    underscored: true
  });

  LeaveRequest.associate = (models) => {
    LeaveRequest.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    LeaveRequest.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
  };

  return LeaveRequest;
};
