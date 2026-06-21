const Course = require('../models/course');
const User = require('../models/user');

const CLASSROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Lab 1', 'Lab 2', 'Seminar Room'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  { startTime: '08:30', endTime: '10:00' },
  { startTime: '10:05', endTime: '11:35' },
  { startTime: '11:40', endTime: '13:10' },
  { startTime: '13:15', endTime: '14:45' },
  { startTime: '14:50', endTime: '16:20' }
];

/**
 * Runs the conflict-free weekly scheduling solver.
 * @returns {Promise<Array>} Array of timetable entries to save
 */
const solveTimetable = async () => {
  // 1. Fetch all courses with teacher details
  const courses = await Course.find().populate('teacher', 'name email');
  if (courses.length === 0) {
    throw new Error('No courses found in the database. Please add courses before generating a timetable.');
  }

  // 2. Prepare allocations: Schedule 2 sessions per course (approx. 3 credit hours each)
  const allocations = [];
  
  // Sort courses by creditHours descending to prioritize hard-to-schedule courses
  const sortedCourses = [...courses].sort((a, b) => b.creditHours - a.creditHours);
  
  for (const course of sortedCourses) {
    allocations.push({ course, session: 1 });
    allocations.push({ course, session: 2 });
  }

  // 3. Track occupancies to prevent conflicts
  // Structure: occupied[entity][day][time] = true
  const classroomOccupied = {};
  const teacherOccupied = {};
  const semesterOccupied = {};

  // Track days assigned to each course to spread them out
  const courseDays = {};

  // Initialize classroom tracker
  CLASSROOMS.forEach(room => {
    classroomOccupied[room] = {};
    DAYS.forEach(day => {
      classroomOccupied[room][day] = {};
    });
  });

  const timetableEntries = [];

  // 4. Greedy Search Solver
  for (const alloc of allocations) {
    const { course, session } = alloc;
    const courseId = course._id.toString();
    const teacherId = course.teacher?._id?.toString() || course.teacher?.toString();
    const semester = course.semester;

    if (!teacherId) {
      throw new Error(`Course "${course.name}" (${course.code}) does not have an assigned teacher.`);
    }

    // Initialize trackers for teacher and semester dynamically
    if (!teacherOccupied[teacherId]) {
      teacherOccupied[teacherId] = {};
      DAYS.forEach(day => { teacherOccupied[teacherId][day] = {}; });
    }
    if (!semesterOccupied[semester]) {
      semesterOccupied[semester] = {};
      DAYS.forEach(day => { semesterOccupied[semester][day] = {}; });
    }
    if (!courseDays[courseId]) {
      courseDays[courseId] = new Set();
    }

    let allocated = false;

    // Two passes strategy:
    // Pass 1: Try to allocate the session on a day this course has NOT been scheduled yet (spread out).
    // Pass 2: If Pass 1 fails (crowded week), allow scheduling on the same day in a different time slot.
    for (let pass = 1; pass <= 2; pass++) {
      if (allocated) break;

      for (const day of DAYS) {
        if (allocated) break;

        // Skip day in Pass 1 if course already has a session scheduled on it
        if (pass === 1 && courseDays[courseId].has(day)) {
          continue;
        }

        for (const slot of TIME_SLOTS) {
          if (allocated) break;

          const slotTime = slot.startTime;

          // Constraint A: Teacher must be free
          if (teacherOccupied[teacherId][day][slotTime]) continue;

          // Constraint B: Semester class must be free (no two classes for BSSE-4 at 8:30)
          if (semesterOccupied[semester][day][slotTime]) continue;

          // Constraint C: Find an unoccupied classroom
          for (const room of CLASSROOMS) {
            if (classroomOccupied[room][day][slotTime]) continue;

            // SUCCESS: All constraints satisfied! Allocate slot.
            classroomOccupied[room][day][slotTime] = true;
            teacherOccupied[teacherId][day][slotTime] = true;
            semesterOccupied[semester][day][slotTime] = true;
            courseDays[courseId].add(day);

            timetableEntries.push({
              course: course._id,
              teacher: course.teacher?._id || course.teacher,
              semester: course.semester,
              day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              classroom: room
            });

            allocated = true;
            break;
          }
        }
      }
    }

    if (!allocated) {
      throw new Error(
        `Failed to generate timetable. Resource limit exceeded for Course: "${course.name}" (${course.code}). ` +
        `No overlapping slots are available for Teacher: ${course.teacher?.name || 'TBA'} or Semester: ${semester}.`
      );
    }
  }

  return timetableEntries;
};

module.exports = { solveTimetable, CLASSROOMS, DAYS, TIME_SLOTS };
