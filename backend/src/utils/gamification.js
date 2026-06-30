const User = require('../models/user');
const Badge = require('../models/badge');

const getLevel = (xp) => {
  return Math.floor((xp || 0) / 500) + 1;
};

const awardXP = async (studentId, xpAmount, actionType, io) => {
  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return;

    const oldXp = student.xp || 0;
    const newXp = oldXp + xpAmount;
    
    const oldLevel = getLevel(oldXp);
    const newLevel = getLevel(newXp);

    student.xp = newXp;
    await student.save();

    // Trigger notifications for XP gain
    if (io) {
      io.to(studentId.toString()).emit('notification', {
        message: `✨ Earned +${xpAmount} XP! (${newXp % 500}/500 to next level)`,
        type: 'info'
      });

      if (newLevel > oldLevel) {
        io.to(studentId.toString()).emit('notification', {
          message: `🎉 Level Up! You reached Level ${newLevel}!`,
          type: 'success'
        });
      }
    }

    // Check Badges
    await checkAndAwardBadges(studentId, actionType, io);

  } catch (error) {
    console.error('Error awarding XP:', error);
  }
};

const checkAndAwardBadges = async (studentId, actionType, io) => {
  try {
    let badgeTitle = '';
    let badgeDesc = '';
    let iconType = 'award';

    if (actionType === 'first_submission') {
      badgeTitle = 'Fast Hand';
      badgeDesc = 'Submitted your first assignment successfully.';
      iconType = 'fire';
    } else if (actionType === 'quiz_master') {
      badgeTitle = 'Quiz Master';
      badgeDesc = 'Scored a perfect score on a course quiz.';
      iconType = 'star';
    } else if (actionType === 'perfect_attendance') {
      badgeTitle = 'Perfect Presence';
      badgeDesc = 'Attended classes consistently and maintained attendance.';
      iconType = 'target';
    } else if (actionType === 'forum_contributor') {
      badgeTitle = 'Thought Leader';
      badgeDesc = 'Started an academic topic or inquiry on the Course Discussion Board.';
      iconType = 'cup';
    }

    if (!badgeTitle) return;

    // Check if student already has this badge
    const existing = await Badge.findOne({ student: studentId, title: badgeTitle });
    if (existing) return;

    // Award badge
    await Badge.create({
      student: studentId,
      title: badgeTitle,
      description: badgeDesc,
      iconType
    });

    if (io) {
      io.to(studentId.toString()).emit('notification', {
        message: `🏆 Badge Unlocked: "${badgeTitle}" - ${badgeDesc}`,
        type: 'success'
      });
    }

  } catch (error) {
    console.error('Error awarding badge:', error);
  }
};

module.exports = { awardXP, getLevel };
