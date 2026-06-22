const Timetable = require('../models/timetable');
const Course = require('../models/course');
const User = require('../models/user');
const Enrollment = require('../models/enrollment');
const { solveTimetable } = require('../utils/scheduler');

// Predefined classrooms in the department
const CLASSROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Lab 1', 'Lab 2', 'Seminar Room'];

// Time format regex (HH:MM in 24h format)
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Helper to convert "HH:MM" to minutes from midnight for direct numerical comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to check if two time ranges overlap
const checkTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
};

// Helper to check for timetable conflicts
const checkConflicts = async ({ day, startTime, endTime, classroom, teacher, semester, section, excludeId }) => {
  const query = { day };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  // Find all schedules on the same day to verify overlaps
  const slots = await Timetable.find(query).populate('course', 'name code');

  for (const slot of slots) {
    if (checkTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      // 1. Classroom Conflict
      if (slot.classroom.toLowerCase() === classroom.toLowerCase()) {
        return {
          conflict: true,
          type: 'classroom',
          message: `Classroom "${classroom}" is already booked for "${slot.course?.name || 'another course'}" (${slot.startTime} - ${slot.endTime})`
        };
      }
      // 2. Teacher Conflict
      if (slot.teacher.toString() === teacher.toString()) {
        return {
          conflict: true,
          type: 'teacher',
          message: `Teacher is already scheduled to teach "${slot.course?.name || 'another course'}" (${slot.startTime} - ${slot.endTime})`
        };
      }
      // 3. Semester Conflict (Specific to Section)
      if (slot.semester === Number(semester) && slot.section === section) {
        return {
          conflict: true,
          type: 'semester',
          message: `Semester ${semester} (Section ${section}) already has a class scheduled: "${slot.course?.name || 'another course'}" (${slot.startTime} - ${slot.endTime})`
        };
      }
    }
  }

  return { conflict: false };
};

// @desc    Create a new timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
exports.createTimetableEntry = async (req, res) => {
  const { courseId, day, startTime, endTime, classroom, section } = req.body;

  try {
    // Validate required fields
    if (!courseId || !day || !startTime || !endTime || !classroom) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate times format
    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Times must be in HH:MM (24-hour) format' });
    }

    // Validate start time < end time
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }

    // Get Course details (to copy teacher and semester)
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const targetSection = section || 'A';

    // Conflict detection
    const conflictResult = await checkConflicts({
      day,
      startTime,
      endTime,
      classroom,
      teacher: course.teacher,
      semester: course.semester,
      section: targetSection
    });

    if (conflictResult.conflict) {
      return res.status(400).json({
        success: false,
        conflictType: conflictResult.type,
        message: conflictResult.message
      });
    }

    // Create entry
    const entry = await Timetable.create({
      course: courseId,
      teacher: course.teacher,
      semester: course.semester,
      section: targetSection,
      day,
      startTime,
      endTime,
      classroom
    });

    const populatedEntry = await Timetable.findById(entry._id)
      .populate('course', 'name code category creditHours')
      .populate('teacher', 'name email');

    res.status(201).json({ success: true, data: populatedEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a timetable entry
// @route   PUT /api/timetable/:id
// @access  Private/Admin
exports.updateTimetableEntry = async (req, res) => {
  const { courseId, day, startTime, endTime, classroom, section } = req.body;

  try {
    let entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    // Validate times format if provided
    const newStartTime = startTime || entry.startTime;
    const newEndTime = endTime || entry.endTime;
    const newDay = day || entry.day;
    const newClassroom = classroom || entry.classroom;
    const targetCourseId = courseId || entry.course;
    const newSection = section || entry.section || 'A';

    if (!TIME_REGEX.test(newStartTime) || !TIME_REGEX.test(newEndTime)) {
      return res.status(400).json({ success: false, message: 'Times must be in HH:MM (24-hour) format' });
    }

    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }

    // Fetch Course details if course changed or to make sure it's correct
    const course = await Course.findById(targetCourseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Conflict detection (excluding current entry ID)
    const conflictResult = await checkConflicts({
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      classroom: newClassroom,
      teacher: course.teacher,
      semester: course.semester,
      section: newSection,
      excludeId: entry._id
    });

    if (conflictResult.conflict) {
      return res.status(400).json({
        success: false,
        conflictType: conflictResult.type,
        message: conflictResult.message
      });
    }

    // Update fields
    entry.course = targetCourseId;
    entry.teacher = course.teacher;
    entry.semester = course.semester;
    entry.section = newSection;
    entry.day = newDay;
    entry.startTime = newStartTime;
    entry.endTime = newEndTime;
    entry.classroom = newClassroom;

    await entry.save();

    const populatedEntry = await Timetable.findById(entry._id)
      .populate('course', 'name code category creditHours')
      .populate('teacher', 'name email');

    res.json({ success: true, data: populatedEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get timetable entries
// @route   GET /api/timetable
// @access  Private
exports.getTimetable = async (req, res) => {
  const { role, id } = req.user;
  const { semester, teacherId, classroom, studentId, section } = req.query;

  try {
    let query = {};

    if (role === 'student') {
      // Student: view only classes of enrolled courses matching their assigned section
      const studentUser = await User.findById(req.user.id);
      const enrollments = await Enrollment.find({ student: req.user.id }).select('course');
      const courseIds = enrollments.map(e => e.course);
      query = { 
        course: { $in: courseIds },
        section: studentUser.section || 'A'
      };
    } else if (role === 'teacher') {
      // Teacher: see their own schedule OR check semester schedules they teach
      if (semester) {
        // Teacher filters by semester, make sure they actually teach at least one course in that semester
        const teachesInSemester = await Course.findOne({ teacher: id, semester: Number(semester) });
        if (!teachesInSemester && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'You do not teach any course in this semester' });
        }
        query = { semester: Number(semester) };
        if (section) {
          query.section = section;
        }
      } else {
        // Own schedule
        query = { teacher: id };
        if (section) {
          query.section = section;
        }
      }
    } else if (role === 'admin' || role === 'hod') {
      // Admin/HOD filters: teacherId, semester, classroom, section, or studentId. Or get all.
      if (teacherId) {
        query.teacher = teacherId;
      }
      if (semester) {
        query.semester = Number(semester);
      }
      if (classroom) {
        query.classroom = classroom;
      }
      if (section) {
        query.section = section;
      }
      if (studentId) {
        const enrollments = await Enrollment.find({ student: studentId }).select('course');
        const courseIds = enrollments.map(e => e.course);
        query.course = { $in: courseIds };
      }
    }

    const entries = await Timetable.find(query)
      .populate('course', 'name code category creditHours')
      .populate('teacher', 'name email')
      .sort({ startTime: 1 });

    res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get free classrooms for a time slot
// @route   GET /api/timetable/free-classrooms
// @access  Private/Admin
exports.getFreeClassrooms = async (req, res) => {
  const { day, startTime, endTime } = req.query;

  try {
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Day, startTime, and endTime are required' });
    }

    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Times must be in HH:MM (24-hour) format' });
    }

    // Find all timetable slots for this day
    const slots = await Timetable.find({ day }).populate('course', 'name code').populate('teacher', 'name');

    const occupancies = [];
    const occupiedClassrooms = new Set();

    for (const slot of slots) {
      if (checkTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        occupiedClassrooms.add(slot.classroom);
        occupancies.push({
          classroom: slot.classroom,
          course: slot.course,
          teacher: slot.teacher,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    }

    // Determine free classrooms
    const freeClassrooms = CLASSROOMS.filter(room => !occupiedClassrooms.has(room));

    res.json({
      success: true,
      data: {
        allClassrooms: CLASSROOMS,
        freeClassrooms,
        occupiedClassrooms: Array.from(occupiedClassrooms),
        occupancies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Automatically generate a weekly conflict-free timetable
// @route   POST /api/timetable/generate-auto
// @access  Private/Admin
exports.generateAutoTimetable = async (req, res) => {
  try {
    // 1. Solve schedule allocations
    const solvedSlots = await solveTimetable();

    // 2. Wipe the existing database collection
    await Timetable.deleteMany({});

    // 3. Save all solved slots
    const savedEntries = await Timetable.insertMany(solvedSlots);

    // 4. Populate details to return a nice summary to the client
    const populated = await Timetable.find({})
      .populate('course', 'name code category creditHours')
      .populate('teacher', 'name email')
      .sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      message: `Successfully cleared the existing schedule and auto-generated ${savedEntries.length} conflict-free course slots!`,
      count: savedEntries.length,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

