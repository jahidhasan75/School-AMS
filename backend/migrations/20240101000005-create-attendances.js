'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendances', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      teacher_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      attendance_date: { type: Sequelize.DATEONLY, allowNull: false },
      check_in_time: { type: Sequelize.TIME, allowNull: true },
      check_out_time: { type: Sequelize.TIME, allowNull: true },
      check_in_latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      check_in_longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      check_out_latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      check_out_longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      check_in_method: { type: Sequelize.ENUM('gps', 'qr', 'manual'), allowNull: true },
      check_out_method: { type: Sequelize.ENUM('gps', 'qr', 'manual'), allowNull: true },
      status: { type: Sequelize.ENUM('present', 'late', 'absent', 'half_day', 'on_leave', 'early_leave', 'holiday'), defaultValue: 'absent' },
      working_minutes: { type: Sequelize.INTEGER, defaultValue: 0 },
      remarks: { type: Sequelize.TEXT, allowNull: true },
      modified_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addConstraint('attendances', {
      fields: ['teacher_id', 'attendance_date'],
      type: 'unique',
      name: 'unique_teacher_date'
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('attendances'); }
};
