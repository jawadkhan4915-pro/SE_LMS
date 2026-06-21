const Course = require('../models/course');
const User = require('../models/user');
const Notice = require('../models/notice');
const Enrollment = require('../models/enrollment');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Builds dynamic system prompt context depending on the user's role and database information.
 */
const buildSystemContext = async (user) => {
  let context = `You are "AI Assistant", the local AI Agent of the Software Engineering Department Learning Management System (SE-LMS).
You are highly helpful, polite, and technical. You help the user navigate and use the LMS effectively.

Here is the current logged-in user details:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role}
`;

  try {
    if (user.role === 'student') {
      // Fetch student courses
      const enrollments = await Enrollment.find({ student: user._id })
        .populate('course');
      const coursesInfo = enrollments
        .map(e => `- ${e.course?.code || 'Code'}: ${e.course?.name || 'Name'} (Credits: ${e.course?.creditHours || 3})`)
        .join('\n');
      
      context += `
The student is currently enrolled in Semester ${user.semester || 'TBA'}.
Their current active courses are:
${coursesInfo || 'No active courses currently enrolled.'}

Help them with how to:
1. View assignments: Go to "Assignments" in sidebar.
2. Check grades: Click "Transcript & Results" to view transcripts and GPAs, or click "Sessional Marks" for quizzes/mids.
3. Track timetables: Click "Class Timetable" in the sidebar.
4. Read notice boards: Click "Notice Board".
5. Join online lectures: Click "Online Lectures" in sidebar.
6. Slips: View slips and print fees in "Slips & Vouchers".
`;
    } else if (user.role === 'teacher') {
      const courses = await Course.find({ teacher: user._id });
      const coursesInfo = courses
        .map(c => `- ${c.code}: ${c.name} (Semester: ${c.semester}, Credits: ${c.creditHours})`)
        .join('\n');
      
      context += `
The teacher teaches the following courses:
${coursesInfo || 'No active courses assigned.'}

Help them with how to:
1. Mark student attendance: Go to "Mark Attendance" in sidebar, select course, date, and toggle students.
2. Manage assignments: Go to "Assignments" to upload briefs and grade submissions.
3. Manage quizzes: Go to "Quizzes" to create test questions and check scores.
4. Manage sessionals: Go to "Sessional Marks" to compute midterms, quizzes, and project scores.
5. Upload exam results: Go to "Manage Exam Results" to upload final GPA sheets.
6. Launch online lectures: Click "Online Lectures" to start interactive classrooms (meeting ID, whiteboard, chat room).
7. View class timetables: Go to "Class Timetable".
`;
    } else if (user.role === 'admin' || user.role === 'hod') {
      const coursesCount = await Course.countDocuments();
      const teachersCount = await User.countDocuments({ role: 'teacher' });
      const studentsCount = await User.countDocuments({ role: 'student' });
      
      context += `
LMS General System Information:
- Total Courses: ${coursesCount}
- Total Teachers: ${teachersCount}
- Total Students: ${studentsCount}
- Available Classrooms: Room 101, Room 102, Room 103, Room 104, Lab 1, Lab 2, Seminar Room.

For the Admin, you can help with user registrations, course configurations, notice board management, and weekly timetable schedules.
If the Admin wants to generate a weekly timetable, remind them that they have a powerful "Auto-Scheduler" tool in the panel that can automatically arrange conflict-free classes in milliseconds.
`;
    }

    // Fetch recent notices
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(3);
    const noticesInfo = notices.map(n => `- ${n.title} (${n.category}): "${n.content.substring(0, 100)}..."`).join('\n');
    context += `
Recent Notice Board Announcements:
${noticesInfo || 'No recent notices posted.'}
`;
  } catch (err) {
    console.error('Error gathering system context for AI:', err);
  }

  context += `
Tone rules:
- Keep your responses structured, clear, and concise.
- Use bullet points, bold text, or numbered lists for readability.
- If asked about operations you cannot complete directly (like updating notice boards or registration), guide the user on the step-by-step path to perform it manually in the UI sidebar.
`;

  return context;
};

/**
 * Rich offline fallback reply generator when GEMINI_API_KEY is not defined.
 */
const getMockReply = (message, user) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello ${user.name}! I am the LMS Help Assistant. How can I help you navigate the system today? (Note: Ask the administrator to add \`GEMINI_API_KEY\` to the backend \`.env\` file to unlock full generative AI capabilities).`;
  }
  
  if (user.role === 'admin' && (msg.includes('timetable') || msg.includes('schedule') || msg.includes('generate') || msg.includes('auto'))) {
    return `As an administrator, you have access to the **Department Auto-Scheduler**. 
    
You can trigger this by clicking the **"Auto-Generate Weekly Timetable"** quick action button on the AI Assistant page or inside the Timetable panel. It will automatically build a weekly timetable for all courses across Monday-Friday, avoiding classroom and teacher conflicts.`;
  }

  if (msg.includes('course') || msg.includes('subject') || msg.includes('class')) {
    if (user.role === 'student') {
      return `To view your courses, click on **"My Courses"** in the sidebar. There you can see details about course credits, instructors, and request new enrollments.`;
    }
    return `To manage courses, navigate to **"Manage Courses"** in the sidebar. There you can create courses, assign teachers, and inspect enrolled student rosters.`;
  }

  if (msg.includes('attendance') || msg.includes('present') || msg.includes('absent')) {
    if (user.role === 'student') {
      return `Your attendance record is available under **"Attendance"** in the sidebar. You can inspect percentage tracking and status lists for each enrolled class.`;
    }
    return `You can log student attendance by navigating to **"Mark Attendance"** in the sidebar. Choose the course, semester date, and toggle students to present/absent.`;
  }

  if (msg.includes('transcript') || msg.includes('grade') || msg.includes('result') || msg.includes('sessional')) {
    if (user.role === 'student') {
      return `You can check your test marks under **"Sessional Marks"** or view final academic progress on the **"Transcript & Results"** sidebar page.`;
    }
    return `You can upload final exam results on the **"Manage Exam Results"** page, or manage sessionals (quizzes, assignments, midterms) under **"Sessional Marks"** in the sidebar.`;
  }

  if (msg.includes('notice') || msg.includes('announcement') || msg.includes('notices')) {
    return `All department announcements can be viewed under the **"Notice Board"** tab. Administrators and HODs can also post new announcements there.`;
  }

  return `I understand you're asking about "${message}". As your help assistant, I suggest visiting the corresponding sections in your sidebar navigation menu. To get advanced generative answers to any query, ask the system administrator to configure the \`GEMINI_API_KEY\` in the backend \`.env\` file.`;
};

// @desc    Process a chat message with the local AI Agent
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 1. Build context
    const systemInstruction = await buildSystemContext(req.user);

    // 2. If API Key is missing, run in offline fallback mode
    if (!apiKey) {
      const mockReply = getMockReply(message, req.user);
      return res.json({
        success: true,
        reply: mockReply,
        isMock: true,
        message: 'Running in offline simulation mode. Add GEMINI_API_KEY to your backend .env to enable live AI.'
      });
    }

    // 3. Initialize Google GenAI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    // 4. Construct conversation history
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      // Map history turns. Gemini API expects role: 'user' or 'model'
      // Limit history to last 10 messages to save context limits
      const limitedHistory = history.slice(-10);
      limitedHistory.forEach(h => {
        formattedHistory.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({
      success: true,
      reply,
      isMock: false
    });
  } catch (error) {
    console.error('LMS AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'AI Agent encountered an error: ' + error.message });
  }
};
