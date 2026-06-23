const User = require('../models/user');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Quiz = require('../models/quiz');
const Question = require('../models/question');
const QuizAttempt = require('../models/quizAttempt');
const Attendance = require('../models/attendance');
const Resource = require('../models/resource');
const Notice = require('../models/notice');

const seedDemoAccounts = async () => {
  try {
    console.log('Cleaning database for fresh university seeding...');
    
    // Clear all existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Attendance.deleteMany({});
    await Resource.deleteMany({});
    await Notice.deleteMany({});

    console.log('Cleared database collections. Starting rich seeding...');

    // 1. Seed Users
    const usersData = [
      // SE Department
      { name: 'Demo Student', email: 'student@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 1234567', department: 'SE' },
      { name: 'Alice Smith', email: 'student2@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 2345678', department: 'SE' },
      { name: 'Bob Johnson', email: 'student3@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 3456789', department: 'SE' },
      { name: 'Charlie Brown', email: 'student4@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 4567890', department: 'SE' },
      { name: 'Prof. Sarah Connor', email: 'teacher@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 1234567', department: 'SE' },
      { name: 'Dr. Alan Turing', email: 'teacher2@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 2345678', department: 'SE' },
      { name: 'Demo HOD', email: 'hod@lms.edu', password: 'password123', role: 'hod', phone: '+92 303 1234567', department: 'SE' },

      // CS Department
      { name: 'Grace Student', email: 'cs_student@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 5556667', department: 'CS' },
      { name: 'Dr. Grace Hopper', email: 'cs_teacher@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 5556667', department: 'CS' },
      { name: 'CS HOD', email: 'cs_hod@lms.edu', password: 'password123', role: 'hod', phone: '+92 303 5556667', department: 'CS' },

      // IT Department
      { name: 'Tim Student', email: 'it_student@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 7778889', department: 'IT' },
      { name: 'Dr. Tim Berners-Lee', email: 'it_teacher@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 7778889', department: 'IT' },
      { name: 'IT HOD', email: 'it_hod@lms.edu', password: 'password123', role: 'hod', phone: '+92 303 7778889', department: 'IT' },

      // EE Department
      { name: 'Nikola Student', email: 'ee_student@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 9990001', department: 'EE' },
      { name: 'Dr. Nikola Tesla', email: 'ee_teacher@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 9990001', department: 'EE' },
      { name: 'EE HOD', email: 'ee_hod@lms.edu', password: 'password123', role: 'hod', phone: '+92 303 9990001', department: 'EE' },

      // General Admin (University-wide, no department)
      { name: 'Demo Admin', email: 'admin@lms.edu', password: 'password123', role: 'admin', phone: '+92 302 1234567' }
    ];

    const usersMap = {};
    for (const u of usersData) {
      const user = await User.create(u);
      console.log(`Seeded User: ${u.email} (${u.role})`);
      usersMap[u.email] = user;
    }

    // 2. Seed Courses
    const coursesData = [
      // SE Courses
      { name: 'Machine Learning', code: 'SE-401', description: 'Introduction to supervised and unsupervised algorithms, regression, classification and clustering.', creditHours: 3, semester: 4, teacher: usersMap['teacher@lms.edu']._id, category: 'AI', department: 'SE' },
      { name: 'Deep Learning', code: 'SE-402', description: 'Advanced neural networks, convolutional nets, recurrent models, and neural architecture designs.', creditHours: 3, semester: 4, teacher: usersMap['teacher@lms.edu']._id, category: 'AI', department: 'SE' },
      { name: 'Generative AI', code: 'SE-403', description: 'Transformer models, Large Language Models (LLMs), prompt architecture engineering and fine-tuning configurations.', creditHours: 4, semester: 4, teacher: usersMap['teacher2@lms.edu']._id, category: 'AI', department: 'SE' },
      { name: 'Natural Language Processing', code: 'SE-404', description: 'Sequence models, syntax parsing, semantic embeddings, and lexical language parsing.', creditHours: 3, semester: 4, teacher: usersMap['teacher2@lms.edu']._id, category: 'Core', department: 'SE' },

      // CS Courses
      { name: 'Data Structures & Algorithms', code: 'CS-201', description: 'Linked lists, trees, graphs, sorting, searching, and algorithm analysis complexity.', creditHours: 3, semester: 4, teacher: usersMap['cs_teacher@lms.edu']._id, category: 'Core', department: 'CS' },
      { name: 'Theory of Computation', code: 'CS-202', description: 'Automata theory, formal languages, Turing machines, and decidability complexity.', creditHours: 3, semester: 4, teacher: usersMap['cs_teacher@lms.edu']._id, category: 'Core', department: 'CS' },

      // IT Courses
      { name: 'Web Technologies', code: 'IT-301', description: 'Frontend development, backend REST APIs, client-server lifecycle and database interactions.', creditHours: 3, semester: 4, teacher: usersMap['it_teacher@lms.edu']._id, category: 'Core', department: 'IT' },
      { name: 'Database Systems', code: 'IT-302', description: 'Relational algebra, SQL query optimization, normalization, transactions, and index patterns.', creditHours: 3, semester: 4, teacher: usersMap['it_teacher@lms.edu']._id, category: 'Core', department: 'IT' },

      // EE Courses
      { name: 'Electric Circuits', code: 'EE-101', description: 'Kirchhoff\'s laws, nodal analysis, AC/DC steady state analysis, and operational amplifiers.', creditHours: 3, semester: 4, teacher: usersMap['ee_teacher@lms.edu']._id, category: 'Core', department: 'EE' },
      { name: 'Digital Logic Design', code: 'EE-102', description: 'Boolean algebra, logic gates, combinational and sequential circuit designs.', creditHours: 3, semester: 4, teacher: usersMap['ee_teacher@lms.edu']._id, category: 'Core', department: 'EE' }
    ];

    const coursesMap = {};
    for (const c of coursesData) {
      const course = await Course.create(c);
      console.log(`Seeded Course: ${c.code}`);
      coursesMap[c.code] = course;
    }

    // 3. Seed Enrollments
    const enrollmentsSetup = [
      // SE Students enrolled in SE Courses
      { student: 'student@lms.edu', courses: ['SE-401', 'SE-402', 'SE-403', 'SE-404'], gpas: { 'SE-401': 4.0, 'SE-402': 4.0 } },
      { student: 'student2@lms.edu', courses: ['SE-401', 'SE-402', 'SE-403', 'SE-404'], gpas: { 'SE-401': 3.3, 'SE-402': 3.3 } },
      { student: 'student3@lms.edu', courses: ['SE-401', 'SE-402', 'SE-403', 'SE-404'], gpas: { 'SE-401': 3.7, 'SE-402': 3.7 } },
      { student: 'student4@lms.edu', courses: ['SE-401', 'SE-402', 'SE-403', 'SE-404'], gpas: { 'SE-401': 3.0, 'SE-402': 3.0 } },

      // CS Student in CS Courses
      { student: 'cs_student@lms.edu', courses: ['CS-201', 'CS-202'], gpas: { 'CS-201': 3.8 } },

      // IT Student in IT Courses
      { student: 'it_student@lms.edu', courses: ['IT-301', 'IT-302'], gpas: { 'IT-301': 3.5 } },

      // EE Student in EE Courses
      { student: 'ee_student@lms.edu', courses: ['EE-101', 'EE-102'], gpas: { 'EE-101': 3.9 } }
    ];

    for (const setup of enrollmentsSetup) {
      const studentObj = usersMap[setup.student];
      for (const code of setup.courses) {
        const courseObj = coursesMap[code];
        const gpa = setup.gpas[code];
        await Enrollment.create({
          student: studentObj._id,
          course: courseObj._id,
          status: gpa ? 'completed' : 'active',
          grade: gpa ? (gpa >= 3.7 ? 'A' : gpa >= 3.3 ? 'B+' : 'B') : '',
          gpa: gpa || 0.0,
          approvalStatus: 'approved'
        });
      }
    }
    console.log('Seeded Enrollments.');

    // 4. Seed Assignments (SE-401 example)
    const asg1 = await Assignment.create({
      course: coursesMap['SE-401']._id,
      title: 'Assignment 1: Linear Regression Implementation',
      description: 'Implement a multivariate gradient descent algorithm to compute house prices. Submit as a Jupyter Notebook exported to PDF.',
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Past deadline
    });

    const asg2 = await Assignment.create({
      course: coursesMap['SE-401']._id,
      title: 'Assignment 2: K-Means Clustering on AI Datasets',
      description: 'Implement K-Means clustering algorithm. Test silhouette scores across different cluster weights on provided iris dataset.',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Future deadline
    });

    // 5. Seed Submissions
    await Submission.create({
      assignment: asg1._id,
      student: usersMap['student@lms.edu']._id,
      fileUrl: '/uploads/linear-johndoe.pdf',
      fileName: 'linear_regression_final.pdf',
      grade: 94,
      feedback: 'Excellent implementation of vector cost functions.'
    });

    await Submission.create({
      assignment: asg1._id,
      student: usersMap['student2@lms.edu']._id,
      fileUrl: '/uploads/linear-alicesmith.pdf',
      fileName: 'se-regression-submission.pdf',
      grade: 86,
      feedback: 'Nice implementation. Your learning rate plot has missing axis labels.'
    });

    await Submission.create({
      assignment: asg1._id,
      student: usersMap['student3@lms.edu']._id,
      fileUrl: '/uploads/linear-bobjohnson.pdf',
      fileName: 'regression-solution-bob.pdf',
      grade: null, // Pending grading
      feedback: ''
    });

    // 6. Seed MCQ Quizzes
    const quiz = await Quiz.create({
      course: coursesMap['SE-401']._id,
      title: 'ML Quiz 1: Supervised vs Unsupervised foundations',
      durationMinutes: 15,
      passingMarks: 3,
      isActive: true
    });

    const questionsList = [
      {
        quiz: quiz._id,
        text: 'Which of the following is a supervised learning algorithm?',
        options: ['K-Means Clustering', 'Principal Component Analysis (PCA)', 'Linear Regression', 'Apriori Association'],
        correctAnswerIndex: 2
      },
      {
        quiz: quiz._id,
        text: 'What is the primary objective of clustering in machine learning?',
        options: ['Predict a continuous numeric target value', 'Group similar instances together without labels', 'Classify categorical output classes', 'Reduce lexical token variations'],
        correctAnswerIndex: 1
      },
      {
        quiz: quiz._id,
        text: 'SVM stands for which of the following algorithms?',
        options: ['Simple Vector Machine', 'Support Vector Machine', 'Super Vector Map', 'Symmetric Vector Model'],
        correctAnswerIndex: 1
      }
    ];
    await Question.insertMany(questionsList);

    // 7. Seed Quiz Attempts
    const qList = await Question.find({ quiz: quiz._id });
    await QuizAttempt.create({
      quiz: quiz._id,
      student: usersMap['student@lms.edu']._id,
      answers: qList.map(q => ({ question: q._id, selectedAnswerIndex: q.correctAnswerIndex })),
      score: 3,
      passed: true
    });

    // 8. Seed Attendance Logs (SE-401)
    const dates = [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    ];

    const seStudentsList = [
      usersMap['student@lms.edu'],
      usersMap['student2@lms.edu'],
      usersMap['student3@lms.edu'],
      usersMap['student4@lms.edu']
    ];

    for (const d of dates) {
      d.setUTCHours(0,0,0,0);
      const records = seStudentsList.map((st, i) => ({
        student: st._id,
        status: i === 0 ? 'present' : (i === 1 ? 'late' : 'absent')
      }));
      await Attendance.create({
        course: coursesMap['SE-401']._id,
        date: d,
        records
      });
    }

    // 9. Seed Resources
    await Resource.create({
      title: 'Lecture 1: Introduction to Machine Learning',
      type: 'pdf',
      url: 'https://se-lms-documents.s3.amazonaws.com/lectures/ml-intro.pdf',
      uploadedBy: usersMap['teacher@lms.edu']._id,
      course: coursesMap['SE-401']._id,
      department: 'SE'
    });

    await Resource.create({
      title: 'Academic Term Paper Template docx',
      type: 'pdf',
      url: 'https://se-lms-documents.s3.amazonaws.com/templates/term_paper.docx',
      uploadedBy: usersMap['admin@lms.edu']._id,
      course: null,
      department: 'SE'
    });

    await Resource.create({
      title: 'Introduction to Data Structures & Trees',
      type: 'pdf',
      url: 'https://cs-lms-documents.s3.amazonaws.com/lectures/ds-trees.pdf',
      uploadedBy: usersMap['cs_teacher@lms.edu']._id,
      course: coursesMap['CS-201']._id,
      department: 'CS'
    });

    // 10. Seed Notices
    await Notice.create({
      title: 'Welcome to the University Learning Management System',
      content: 'Welcome students and faculty to our unified University LMS. Use this portal to track courses, review transcripts, attempt quizzes, and coordinate with teachers across all departments.',
      targetRoles: ['student', 'teacher', 'hod'],
      postedBy: usersMap['admin@lms.edu']._id,
      department: 'all'
    });

    await Notice.create({
      title: 'Software Engineering Term Paper Guidelines',
      content: 'All elective and core research modules require submission of a 4-page term paper in ACM format. Deadline is July 15, 2026.',
      targetRoles: ['student'],
      postedBy: usersMap['hod@lms.edu']._id,
      department: 'SE'
    });

    await Notice.create({
      title: 'CS Algorithms Lab Setup Instructions',
      content: 'Make sure to configure GCC or Clang environments prior to lab session 2. Code submissions will be evaluated on complexity and performance profiles.',
      targetRoles: ['student'],
      postedBy: usersMap['cs_hod@lms.edu']._id,
      department: 'CS'
    });

    console.log('Fresh University Database Seeding Completed Successfully!');
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};

module.exports = seedDemoAccounts;
