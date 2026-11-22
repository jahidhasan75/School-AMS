'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Teacher = require('./Teacher')(sequelize, DataTypes);
const Admin = require('./Admin')(sequelize, DataTypes);
const Attendance = require('./Attendance')(sequelize, DataTypes);
const LeaveRequest = require('./LeaveRequest')(sequelize, DataTypes);
const SchoolSettings = require('./SchoolSettings')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const QrSession = require('./QrSession')(sequelize, DataTypes);
const Holiday = require('./Holiday')(sequelize, DataTypes);
const Department = require('./Department')(sequelize, DataTypes);
const Subject = require('./Subject')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  User,
  Teacher,
  Admin,
  Attendance,
  LeaveRequest,
  SchoolSettings,
  Notification,
  QrSession,
  Holiday,
  Department,
  Subject,
  AuditLog
};

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
