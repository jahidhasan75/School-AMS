'use strict';

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const teachersList = [
  { name: 'Md. Rafiqul Islam', subject: 'Physics', department: 'Science', designation: 'Senior Teacher', phone: '01711000001' },
  { name: 'Fatema Begum', subject: 'Chemistry', department: 'Science', designation: 'Teacher', phone: '01711000002' },
  { name: 'Abdul Karim Khan', subject: 'Mathematics', department: 'Mathematics', designation: 'Head of Department', phone: '01711000003' },
  { name: 'Nasrin Sultana', subject: 'Algebra', department: 'Mathematics', designation: 'Senior Teacher', phone: '01711000004' },
  { name: 'Mohammad Hossain', subject: 'English Literature', department: 'English', designation: 'Teacher', phone: '01711000005' },
  { name: 'Rahela Khatun', subject: 'English Grammar', department: 'English', designation: 'Senior Teacher', phone: '01711000006' },
  { name: 'Jamal Uddin Ahmed', subject: 'History', department: 'Social Science', designation: 'Teacher', phone: '01711000007' },
  { name: 'Moriam Akter', subject: 'Geography', department: 'Social Science', designation: 'Teacher', phone: '01711000008' },
  { name: 'Shahadat Hossain', subject: 'Computer Science', department: 'ICT', designation: 'Head of Department', phone: '01711000009' },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Helper: Find or create user to prevent duplicate unique key errors
    const ensureUser = async (email, plainPassword, role) => {
      const existing = await queryInterface.sequelize.query(
        'SELECT id, email, role FROM users WHERE email = :email',
        { replacements: { email }, type: Sequelize.QueryTypes.SELECT }
      );
      if (existing && existing.length > 0) {
        return existing[0].id;
      }
      const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      await queryInterface.bulkInsert('users', [{
        email,
        password: hashed,
        role,
        is_active: true,
        created_at: now,
        updated_at: now
      }]);
      const created = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = :email',
        { replacements: { email }, type: Sequelize.QueryTypes.SELECT }
      );
      return created[0].id;
    };

    // 1. Admin user and profile
    const adminUserId = await ensureUser('admin@schoolams.demo', 'Admin@123', 'admin');
    const existingAdmin = await queryInterface.sequelize.query(
      'SELECT id FROM admins WHERE user_id = :userId',
      { replacements: { userId: adminUserId }, type: Sequelize.QueryTypes.SELECT }
    );
    if (!existingAdmin || existingAdmin.length === 0) {
      await queryInterface.bulkInsert('admins', [{
        user_id: adminUserId,
        full_name: 'School Administrator',
        phone: '+8801700000000',
        created_at: now,
        updated_at: now
      }]);
    }

    // 2. Demo Teacher (TCH001)
    const demoTeacherUserId = await ensureUser('teacher@schoolams.demo', 'Teacher@123', 'teacher');
    let demoTeacher = await queryInterface.sequelize.query(
      'SELECT id FROM teachers WHERE teacher_id = :tid',
      { replacements: { tid: 'TCH001' }, type: Sequelize.QueryTypes.SELECT }
    );
    let demoTeacherId;
    if (!demoTeacher || demoTeacher.length === 0) {
      await queryInterface.bulkInsert('teachers', [{
        user_id: demoTeacherUserId,
        teacher_id: 'TCH001',
        full_name: 'Md. Rafiqul Islam',
        phone: '01711000001',
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
        subject: 'Physics',
        department: 'Science',
        designation: 'Senior Teacher',
        joining_date: '2018-01-15',
        created_at: now,
        updated_at: now
      }]);
      const createdT = await queryInterface.sequelize.query(
        'SELECT id FROM teachers WHERE teacher_id = :tid',
        { replacements: { tid: 'TCH001' }, type: Sequelize.QueryTypes.SELECT }
      );
      demoTeacherId = createdT[0].id;
    } else {
      demoTeacherId = demoTeacher[0].id;
    }

    // 3. Other Teachers (TCH002 - TCH010)
    for (let i = 0; i < teachersList.length; i++) {
      const t = teachersList[i];
      const tid = `TCH00${i + 2}`;
      const email = `teacher${i + 2}@schoolams.demo`;
      const tUserId = await ensureUser(email, 'Teacher@123', 'teacher');

      const existingT = await queryInterface.sequelize.query(
        'SELECT id FROM teachers WHERE teacher_id = :tid',
        { replacements: { tid }, type: Sequelize.QueryTypes.SELECT }
      );
      if (!existingT || existingT.length === 0) {
        await queryInterface.bulkInsert('teachers', [{
          user_id: tUserId,
          teacher_id: tid,
          full_name: t.name,
          phone: t.phone,
          address: `House ${i + 10}, Dhaka`,
          subject: t.subject,
          department: t.department,
          designation: t.designation,
          joining_date: `${2015 + (i % 5)}-0${(i % 9) + 1}-${10 + i}`,
          created_at: now,
          updated_at: now
        }]);
      }
    }

    // 4. Departments
    const deptCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM departments',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!deptCount || parseInt(deptCount[0].count, 10) === 0) {
      await queryInterface.bulkInsert('departments', [
        { name: 'Science', created_at: now, updated_at: now },
        { name: 'Mathematics', created_at: now, updated_at: now },
        { name: 'English', created_at: now, updated_at: now },
        { name: 'Social Science', created_at: now, updated_at: now },
        { name: 'ICT', created_at: now, updated_at: now }
      ]);
    }

    // 5. School settings
    const settingsCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM school_settings',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!settingsCount || parseInt(settingsCount[0].count, 10) === 0) {
      await queryInterface.bulkInsert('school_settings', [{
        school_name: 'Dhaka Model School',
        school_address: 'Mirpur Road, Dhanmondi, Dhaka-1205, Bangladesh',
        school_email: 'info@dhakamodelschool.edu.bd',
        school_phone: '+8801700000000',
        latitude: 23.8103,
        longitude: 90.4125,
        allowed_radius_meters: 200,
        office_start_time: '09:00:00',
        office_end_time: '17:00:00',
        grace_period_minutes: 15,
        min_working_hours: 7.0,
        late_calculation_minutes: 15,
        weekend_days: JSON.stringify(['Friday', 'Saturday']),
        qr_attendance_enabled: 1,
        gps_attendance_enabled: 0,
        created_at: now,
        updated_at: now
      }]);
    }

    // 6. Holidays
    const holidaysCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM holidays',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!holidaysCount || parseInt(holidaysCount[0].count, 10) === 0) {
      await queryInterface.bulkInsert('holidays', [
        { date: '2024-02-21', name: 'International Mother Language Day', created_at: now, updated_at: now },
        { date: '2024-03-17', name: 'Birth Anniversary of Bangabandhu', created_at: now, updated_at: now },
        { date: '2024-03-26', name: 'Independence Day', created_at: now, updated_at: now },
        { date: '2024-04-14', name: 'Pahela Baishakh (Bengali New Year)', created_at: now, updated_at: now },
        { date: '2024-04-10', name: 'Eid ul-Fitr', created_at: now, updated_at: now },
        { date: '2024-04-11', name: 'Eid ul-Fitr Holiday', created_at: now, updated_at: now },
        { date: '2024-05-01', name: 'May Day (Labour Day)', created_at: now, updated_at: now },
        { date: '2024-08-15', name: 'National Mourning Day', created_at: now, updated_at: now },
        { date: '2024-12-16', name: 'Victory Day', created_at: now, updated_at: now },
        { date: '2024-12-25', name: 'Christmas Day', created_at: now, updated_at: now }
      ]);
    }

    // 7. Sample Attendance Records (last 30 days for demo teacher)
    const existingAtt = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM attendances WHERE teacher_id = :tid',
      { replacements: { tid: demoTeacherId }, type: Sequelize.QueryTypes.SELECT }
    );
    if (!existingAtt || parseInt(existingAtt[0].count, 10) === 0) {
      const attendanceRows = [];
      const statusOptions = ['present', 'present', 'present', 'late', 'present', 'absent'];
      for (let d = 29; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayName === 'Friday' || dayName === 'Saturday') continue;

        const statusIdx = Math.floor(Math.random() * statusOptions.length);
        const status = statusOptions[statusIdx];
        let checkIn = null, checkOut = null, workingMins = 0;

        if (status !== 'absent') {
          const inHour = status === 'late' ? 9 : 8;
          const inMin = status === 'late' ? 30 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 55);
          checkIn = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;
          checkOut = `17:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`;
          workingMins = Math.round((17 * 60 + 15) - (inHour * 60 + inMin));
        }

        attendanceRows.push({
          teacher_id: demoTeacherId,
          attendance_date: date.toISOString().split('T')[0],
          check_in_time: checkIn,
          check_out_time: checkOut,
          check_in_method: status !== 'absent' ? 'manual' : null,
          check_out_method: checkOut ? 'manual' : null,
          status,
          working_minutes: workingMins,
          created_at: now,
          updated_at: now
        });
      }
      if (attendanceRows.length > 0) {
        await queryInterface.bulkInsert('attendances', attendanceRows);
      }
    }

    // 8. Sample Leave Requests
    const leavesCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM leave_requests',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!leavesCount || parseInt(leavesCount[0].count, 10) === 0) {
      const allT = await queryInterface.sequelize.query(
        'SELECT id FROM teachers LIMIT 3',
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (allT && allT.length > 0) {
        const leaveRows = [
          {
            teacher_id: allT[0].id,
            leave_type: 'sick',
            start_date: '2024-11-05',
            end_date: '2024-11-07',
            total_days: 3,
            reason: 'Suffering from fever and flu. Doctor recommended bed rest.',
            status: 'approved',
            admin_remarks: 'Approved. Get well soon.',
            approved_by: adminUserId,
            approved_at: new Date('2024-11-04'),
            created_at: now,
            updated_at: now
          },
          {
            teacher_id: allT[1] ? allT[1].id : allT[0].id,
            leave_type: 'casual',
            start_date: '2024-11-18',
            end_date: '2024-11-18',
            total_days: 1,
            reason: 'Family event attendance required.',
            status: 'pending',
            created_at: now,
            updated_at: now
          },
          {
            teacher_id: allT[2] ? allT[2].id : allT[0].id,
            leave_type: 'personal',
            start_date: '2024-10-20',
            end_date: '2024-10-21',
            total_days: 2,
            reason: 'Personal work in home district.',
            status: 'rejected',
            admin_remarks: 'Too close to exam period. Cannot approve.',
            approved_by: adminUserId,
            approved_at: new Date('2024-10-19'),
            created_at: now,
            updated_at: now
          }
        ];
        await queryInterface.bulkInsert('leave_requests', leaveRows);
      }
    }

    // 9. Sample Notifications
    const notifsCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM notifications',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!notifsCount || parseInt(notifsCount[0].count, 10) === 0) {
      const notifRows = [
        {
          user_id: demoTeacherUserId,
          title: 'Welcome to School AMS',
          message: 'Your account has been created. Please complete your profile.',
          type: 'announcement',
          is_read: false,
          created_at: now,
          updated_at: now
        },
        {
          user_id: demoTeacherUserId,
          title: 'Leave Application Approved',
          message: 'Your sick leave from Nov 5-7 has been approved.',
          type: 'leave',
          is_read: true,
          created_at: now,
          updated_at: now
        },
        {
          user_id: adminUserId,
          title: 'New Leave Request',
          message: 'A teacher has submitted a new leave request pending your review.',
          type: 'leave',
          is_read: false,
          created_at: now,
          updated_at: now
        }
      ];
      await queryInterface.bulkInsert('notifications', notifRows);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('leave_requests', null, {});
    await queryInterface.bulkDelete('attendances', null, {});
    await queryInterface.bulkDelete('holidays', null, {});
    await queryInterface.bulkDelete('school_settings', null, {});
    await queryInterface.bulkDelete('departments', null, {});
    await queryInterface.bulkDelete('teachers', null, {});
    await queryInterface.bulkDelete('admins', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
