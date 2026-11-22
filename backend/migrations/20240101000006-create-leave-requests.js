'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leave_requests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      teacher_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      leave_type: { type: Sequelize.ENUM('casual', 'sick', 'emergency', 'personal', 'annual'), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      total_days: { type: Sequelize.INTEGER, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: false },
      document_path: { type: Sequelize.STRING(500), allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      admin_remarks: { type: Sequelize.TEXT, allowNull: true },
      approved_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      approved_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('leave_requests'); }
};
