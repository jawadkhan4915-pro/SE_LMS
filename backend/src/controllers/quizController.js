const Quiz = require('../models/quiz');
const Question = require('../models/question');
const QuizAttempt = require('../models/quizAttempt');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');

// @desc    Create a new MCQ quiz
// @route   POST /api/quizzes
// @access  Private/Teacher
exports.createQuiz = async (req, res) => {
  const { courseId, title, durationMinutes, passingMarks } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create quizzes here' });
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      durationMinutes,
      passingMarks
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add questions to quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private/Teacher
exports.addQuestions = async (req, res) => {
  const { questions } = req.body; // Array of { text, options, correctAnswerIndex }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this quiz' });
    }

    // Insert questions mapping quiz ID
    const questionsWithQuizId = questions.map(q => ({ ...q, quiz: req.params.id }));
    const createdQuestions = await Question.insertMany(questionsWithQuizId);

    res.status(201).json({ success: true, count: createdQuestions.length, data: createdQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle quiz active status
// @route   PUT /api/quizzes/:id/toggle
// @access  Private/Teacher
exports.toggleQuizStatus = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to toggle this quiz' });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({ success: true, message: `Quiz is now ${quiz.isActive ? 'Active' : 'Inactive'}`, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get questions for student to attempt (Strips correctAnswerIndex!)
// @route   GET /api/quizzes/:id/questions
// @access  Private/Student
exports.getQuizQuestionsForStudent = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isActive && req.user.role === 'student') {
      return res.status(400).json({ success: false, message: 'Quiz is not active yet' });
    }

    // Student enrollment validation
    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: quiz.course });
      if (!enrolled) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      }

      // Check if already attempted
      const alreadyAttempted = await QuizAttempt.findOne({ quiz: req.params.id, student: req.user.id });
      if (alreadyAttempted) {
        return res.status(400).json({ success: false, message: 'You have already attempted this quiz' });
      }
    }

    // Exclude correctAnswerIndex when sending questions to students
    let projection = {};
    if (req.user.role === 'student') {
      projection = { correctAnswerIndex: 0 };
    }

    const questions = await Question.find({ quiz: req.params.id }, projection);
    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Attempt/Submit a quiz
// @route   POST /api/quizzes/:id/attempt
// @access  Private/Student
exports.attemptQuiz = async (req, res) => {
  const { answers } = req.body; // Array of { questionId, selectedAnswerIndex }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      return res.status(400).json({ success: false, message: 'This quiz is no longer accepting submissions' });
    }

    // Check if already attempted
    const alreadyAttempted = await QuizAttempt.findOne({ quiz: req.params.id, student: req.user.id });
    if (alreadyAttempted) {
      return res.status(400).json({ success: false, message: 'Already attempted this quiz' });
    }

    // Retrieve full questions with answers for server validation
    const questions = await Question.find({ quiz: req.params.id });
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'This quiz has no questions' });
    }

    let correctCount = 0;
    const attemptAnswers = [];

    // Evaluate answers
    questions.forEach((q) => {
      const studentAnswer = answers.find(a => a.question === q._id.toString() || a.questionId === q._id.toString());
      const selectedIndex = studentAnswer ? studentAnswer.selectedAnswerIndex : -1;
      
      if (selectedIndex === q.correctAnswerIndex) {
        correctCount++;
      }
      
      attemptAnswers.push({
        question: q._id,
        selectedAnswerIndex: selectedIndex
      });
    });

    // Score is number of correct answers
    const score = correctCount;
    const passed = score >= quiz.passingMarks;

    const attempt = await QuizAttempt.create({
      quiz: req.params.id,
      student: req.user.id,
      answers: attemptAnswers,
      score,
      passed
    });

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        totalQuestions: questions.length,
        passed,
        passingMarks: quiz.passingMarks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's attempt details for a quiz
// @route   GET /api/quizzes/:id/my-attempt
// @access  Private/Student
exports.getMyAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ quiz: req.params.id, student: req.user.id })
      .populate('quiz', 'title durationMinutes passingMarks');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No attempt record found' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attempts/scores for a quiz
// @route   GET /api/quizzes/:id/attempts
// @access  Private/Teacher/Admin
exports.getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('student', 'name email semester');
      
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
