'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('school_settings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_name: { type: Sequelize.STRING(255), defaultValue: 'Dhaka Model School' },
      school_address: { type: Sequelize.TEXT, allowNull: true },
      school_email: { type: Sequelize.STRING(255), allowNull: true },
      school_phone: { type: Sequelize.STRING(20), allowNull: true },
      school_logo: { type: Sequelize.STRING(500), allowNull: true },
      latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      allowed_radius_meters: { type: Sequelize.INTEGER, defaultValue: 200 },
      office_start_time: { type: Sequelize.TIME, defaultValue: '09:00:00' },
      office_end_time: { type: Sequelize.TIME, defaultValue: '17:00:00' },
      grace_period_minutes: { type: Sequelize.INTEGER, defaultValue: 15 },
      min_working_hours: { type: Sequelize.DECIMAL(4, 2), defaultValue: 7.0 },
      late_calculation_minutes: { type: Sequelize.INTEGER, defaultValue: 15 },
      weekend_days: { type: Sequelize.JSON, defaultValue: ['Friday', 'Saturday'] },
      qr_attendance_enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
      gps_attendance_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('school_settings'); }
};
