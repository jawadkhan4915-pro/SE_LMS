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
    console.log('Starting rich database seeding...');

    // 1. Seed Users
    const usersData = [
      { name: 'Demo Student', email: 'student@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 1234567' },
      { name: 'Alice Smith', email: 'student2@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 2345678' },
      { name: 'Bob Johnson', email: 'student3@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 3456789' },
      { name: 'Charlie Brown', email: 'student4@lms.edu', password: 'password123', role: 'student', semester: 4, phone: '+92 300 4567890' },
      { name: 'Prof. Sarah Connor', email: 'teacher@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 1234567' },
      { name: 'Dr. Alan Turing', email: 'teacher2@lms.edu', password: 'password123', role: 'teacher', phone: '+92 301 2345678' },
      { name: 'Demo Admin', email: 'admin@lms.edu', password: 'password123', role: 'admin', phone: '+92 302 1234567' },
      { name: 'Demo HOD', email: 'hod@lms.edu', password: 'password123', role: 'hod', phone: '+92 303 1234567' }
    ];

    const usersMap = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`Seeded User: ${u.email}`);
      }
      usersMap[u.email] = user;
    }

    // 2. Seed Courses
    const coursesData = [
      { name: 'Machine Learning', code: 'SE-401', description: 'Introduction to supervised and unsupervised algorithms, regression, classification and clustering.', creditHours: 3, semester: 4, teacher: usersMap['teacher@lms.edu']._id, category: 'AI' },
      { name: 'Deep Learning', code: 'SE-402', description: 'Advanced neural networks, convolutional nets, recurrent models, and neural architecture designs.', creditHours: 3, semester: 4, teacher: usersMap['teacher@lms.edu']._id, category: 'AI' },
      { name: 'Generative AI', code: 'SE-403', description: 'Transformer models, Large Language Models (LLMs), prompt architecture engineering and fine-tuning configurations.', creditHours: 4, semester: 4, teacher: usersMap['teacher2@lms.edu']._id, category: 'AI' },
      { name: 'Natural Language Processing', code: 'SE-404', description: 'Sequence models, syntax parsing, semantic embeddings, and lexical language parsing.', creditHours: 3, semester: 4, teacher: usersMap['teacher2@lms.edu']._id, category: 'Core' }
    ];

    const coursesMap = {};
    for (const c of coursesData) {
      let course = await Course.findOne({ code: c.code });
      if (!course) {
        course = await Course.create(c);
        console.log(`Seeded Course: ${c.code}`);
      }
      coursesMap[c.code] = course;
    }

    // 3. Seed Enrollments
    const studentsList = [
      usersMap['student@lms.edu'],
      usersMap['student2@lms.edu'],
      usersMap['student3@lms.edu'],
      usersMap['student4@lms.edu']
    ];

    const coursesList = [
      coursesMap['SE-401'],
      coursesMap['SE-402'],
      coursesMap['SE-403'],
      coursesMap['SE-404']
    ];

    // Seed completed and active enrollments to feed average HOD/Student stats
    const gpaSpread = {
      'student@lms.edu': { grade: 'A', gpa: 4.0 },
      'student2@lms.edu': { grade: 'B+', gpa: 3.3 },
      'student3@lms.edu': { grade: 'A-', gpa: 3.7 },
      'student4@lms.edu': { grade: 'B', gpa: 3.0 }
    };

    for (const student of studentsList) {
      for (const course of coursesList) {
        const enrollmentExists = await Enrollment.findOne({ student: student._id, course: course._id });
        if (!enrollmentExists) {
          // Set SE-401 & SE-402 as completed to test GPA stats, and others as active
          const isCompleted = ['SE-401', 'SE-402'].includes(course.code);
          await Enrollment.create({
            student: student._id,
            course: course._id,
            status: isCompleted ? 'completed' : 'active',
            grade: isCompleted ? gpaSpread[student.email].grade : '',
            gpa: isCompleted ? gpaSpread[student.email].gpa : 0.0
          });
        }
      }
    }
    console.log('Seeded Student Enrollments.');

    // 4. Seed Assignments
    const assignmentExists = await Assignment.findOne({ course: coursesMap['SE-401']._id });
    let asg1, asg2;
    if (!assignmentExists) {
      asg1 = await Assignment.create({
        course: coursesMap['SE-401']._id,
        title: 'Assignment 1: Linear Regression Implementation',
        description: 'Implement a multivariate gradient descent algorithm to compute house prices. Submit as a Jupyter Notebook exported to PDF.',
        deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Past deadline (3 days ago)
      });

      asg2 = await Assignment.create({
        course: coursesMap['SE-401']._id,
        title: 'Assignment 2: K-Means Clustering on AI Datasets',
        description: 'Implement K-Means clustering algorithm. Test silhouette scores across different cluster weights on provided iris dataset.',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Future deadline (in 5 days)
      });
      console.log('Seeded Machine Learning Assignments.');
    } else {
      asg1 = await Assignment.findOne({ title: 'Assignment 1: Linear Regression Implementation' });
    }

    // 5. Seed Submissions
    if (asg1) {
      const submissionExists = await Submission.findOne({ assignment: asg1._id });
      if (!submissionExists) {
        // John Doe - graded
        await Submission.create({
          assignment: asg1._id,
          student: usersMap['student@lms.edu']._id,
          fileUrl: '/uploads/linear-johndoe.pdf',
          fileName: 'linear_regression_final.pdf',
          grade: 94,
          feedback: 'Excellent implementation of vector cost functions.'
        });

        // Alice Smith - graded
        await Submission.create({
          assignment: asg1._id,
          student: usersMap['student2@lms.edu']._id,
          fileUrl: '/uploads/linear-alicesmith.pdf',
          fileName: 'se-regression-submission.pdf',
          grade: 86,
          feedback: 'Nice implementation. Your learning rate plot has missing axis labels.'
        });

        // Bob Johnson - pending grading
        await Submission.create({
          assignment: asg1._id,
          student: usersMap['student3@lms.edu']._id,
          fileUrl: '/uploads/linear-bobjohnson.pdf',
          fileName: 'regression-solution-bob.pdf',
          grade: null, // Pending grading
          feedback: ''
        });

        // Charlie Brown - graded
        await Submission.create({
          assignment: asg1._id,
          student: usersMap['student4@lms.edu']._id,
          fileUrl: '/uploads/linear-charlie.pdf',
          fileName: 'charlie-regression-task.pdf',
          grade: 75,
          feedback: 'Correct output values, but did not implement vectorized cost. For-loops run with poor computational performance.'
        });
        console.log('Seeded Student Submissions.');
      }
    }

    // 6. Seed MCQ Quizzes
    const quizExists = await Quiz.findOne({ course: coursesMap['SE-401']._id });
    let quiz;
    if (!quizExists) {
      quiz = await Quiz.create({
        course: coursesMap['SE-401']._id,
        title: 'ML Quiz 1: Supervised vs Unsupervised foundations',
        durationMinutes: 15,
        passingMarks: 3,
        isActive: true
      });

      // Seed Quiz Questions
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
        },
        {
          quiz: quiz._id,
          text: 'Which activation function is typically used in binary logistic regression output?',
          options: ['Rectified Linear Unit (ReLU)', 'Sigmoid Function', 'Hyperbolic Tangent (Tanh)', 'Softmax Function'],
          correctAnswerIndex: 1
        },
        {
          quiz: quiz._id,
          text: 'Overfitting in complex models can be mitigated using which method?',
          options: ['Increasing model parameter size', 'L1/L2 Regularization techniques', 'Training infinitely for maximum epochs', 'Reducing data size'],
          correctAnswerIndex: 1
        }
      ];
      await Question.insertMany(questionsList);
      console.log('Seeded ML Quiz & MCQ Questions Pool.');
    } else {
      quiz = await Quiz.findOne({ course: coursesMap['SE-401']._id });
    }

    // 7. Seed Quiz Attempts
    if (quiz) {
      const attemptExists = await QuizAttempt.findOne({ quiz: quiz._id });
      if (!attemptExists) {
        const qList = await Question.find({ quiz: quiz._id });
        
        // John Doe - score 5/5
        await QuizAttempt.create({
          quiz: quiz._id,
          student: usersMap['student@lms.edu']._id,
          answers: qList.map(q => ({ question: q._id, selectedAnswerIndex: q.correctAnswerIndex })),
          score: 5,
          passed: true
        });

        // Alice Smith - score 4/5
        await QuizAttempt.create({
          quiz: quiz._id,
          student: usersMap['student2@lms.edu']._id,
          answers: qList.map((q, idx) => ({ question: q._id, selectedAnswerIndex: idx === 3 ? 0 : q.correctAnswerIndex })),
          score: 4,
          passed: true
        });

        // Bob Johnson - score 2/5 (Failed)
        await QuizAttempt.create({
          quiz: quiz._id,
          student: usersMap['student3@lms.edu']._id,
          answers: qList.map((q, idx) => ({ question: q._id, selectedAnswerIndex: idx === 0 || idx === 2 || idx === 4 ? 0 : q.correctAnswerIndex })),
          score: 2,
          passed: false
        });
        console.log('Seeded Quiz Attempts.');
      }
    }

    // 8. Seed Attendance Logs
    const attendanceExists = await Attendance.findOne({ course: coursesMap['SE-401']._id });
    if (!attendanceExists) {
      const dates = [
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      ];

      // Mark student attendance records
      const statuses = {
        'student@lms.edu': ['present', 'present', 'present', 'present', 'present'], // 100%
        'student2@lms.edu': ['present', 'late', 'present', 'present', 'absent'], // 70%
        'student3@lms.edu': ['present', 'absent', 'absent', 'present', 'present'], // 60%
        'student4@lms.edu': ['present', 'present', 'present', 'present', 'absent'] // 80%
      };

      for (const d of dates) {
        const formattedDateObj = new Date(d);
        formattedDateObj.setUTCHours(0,0,0,0);

        const records = studentsList.map(st => ({
          student: st._id,
          status: statuses[st.email][dates.indexOf(d)]
        }));

        await Attendance.create({
          course: coursesMap['SE-401']._id,
          date: formattedDateObj,
          records
        });
      }
      console.log('Seeded Course Attendance Sheets.');
    }

    // 9. Seed Resources
    const resourceExists = await Resource.findOne({ title: 'Lecture 1: Introduction to Machine Learning' });
    if (!resourceExists) {
      await Resource.create({
        title: 'Lecture 1: Introduction to Machine Learning',
        type: 'pdf',
        url: 'https://se-lms-documents.s3.amazonaws.com/lectures/ml-intro.pdf',
        uploadedBy: usersMap['teacher@lms.edu']._id,
        course: coursesMap['SE-401']._id
      });

      await Resource.create({
        title: 'Dataset: Housing Prices CSV',
        type: 'dataset',
        url: 'https://github.com/se-lms/datasets/housing.csv',
        uploadedBy: usersMap['teacher@lms.edu']._id,
        course: coursesMap['SE-401']._id
      });

      await Resource.create({
        title: 'Large Language Models (LLMs) Survey Paper',
        type: 'research_paper',
        url: 'https://arxiv.org/pdf/2303.18223.pdf',
        uploadedBy: usersMap['teacher2@lms.edu']._id,
        course: coursesMap['SE-403']._id
      });

      await Resource.create({
        title: 'Academic Term Paper Template docx',
        type: 'pdf',
        url: 'https://se-lms-documents.s3.amazonaws.com/templates/term_paper.docx',
        uploadedBy: usersMap['admin@lms.edu']._id,
        course: null // General department resource
      });
      console.log('Seeded Library Reference Resources.');
    }

    // 10. Seed Notices
    const noticesExists = await Notice.findOne({ title: 'Welcome to Software Engineering Department LMS' });
    if (!noticesExists) {
      await Notice.create({
        title: 'Welcome to Software Engineering Department LMS',
        content: 'Welcome students and faculty to the new Software Engineering Learning Management System. Use this portal to track courses, review grade reports, attempt MCQ quizzes and submit assignments online.',
        targetRoles: ['student', 'teacher', 'hod'],
        postedBy: usersMap['admin@lms.edu']._id
      });

      await Notice.create({
        title: 'Term Paper Submission Guidelines',
        content: 'All elective and core research modules require submission of a 4-page term paper in ACM format. Please refer to the template uploaded in the resource library. Deadline for proposal submission is July 15, 2026.',
        targetRoles: ['student'],
        postedBy: usersMap['hod@lms.edu']._id
      });
      console.log('Seeded Bulletin Notices Board.');
    }

    console.log('Rich Database Seeding Completed Successfully!');
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};

module.exports = seedDemoAccounts;
