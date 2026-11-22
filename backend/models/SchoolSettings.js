'use strict';

module.exports = (sequelize, DataTypes) => {
  const SchoolSettings = sequelize.define('SchoolSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    school_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: 'School AMS'
    },
    school_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    school_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    school_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    school_logo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    allowed_radius_meters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 200
    },
    office_start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '09:00:00'
    },
    office_end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '17:00:00'
    },
    grace_period_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    },
    min_working_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      defaultValue: 7.00
    },
    late_calculation_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30
    },
    weekend_days: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [5, 6]  // Friday=5, Saturday=6
    },
    qr_attendance_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    gps_attendance_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'school_settings',
    timestamps: true,
    underscored: true
  });

  return SchoolSettings;
};
