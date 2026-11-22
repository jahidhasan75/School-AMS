'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teachers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      teacher_id: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      full_name: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      subject: { type: Sequelize.STRING(100), allowNull: true },
      department: { type: Sequelize.STRING(100), allowNull: true },
      designation: { type: Sequelize.STRING(100), allowNull: true },
      joining_date: { type: Sequelize.DATEONLY, allowNull: true },
      profile_image: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('teachers'); }
};
