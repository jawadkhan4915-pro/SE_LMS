const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    index: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'hod', 'coordinator', 'accountant'], 
    required: [true, 'Role is required']
  },
  department: {
    type: String,
    enum: ['SE', 'CS', 'IT', 'EE'],
    required: function() { return this.role !== 'admin' && this.role !== 'coordinator' && this.role !== 'accountant'; }, // Required for all except admin, coordinator, and accountant
    default: function() { return (this.role === 'admin' || this.role === 'coordinator' || this.role === 'accountant') ? undefined : 'SE'; }
  },
  examSlipOverride: {
    type: Boolean,
    default: false
  },
  semester: { 
    type: Number, 
    required: function() { return this.role === 'student'; } // Required only for students
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: function() { return this.role === 'student'; }, // Required only for students
    default: function() { return this.role === 'student' ? 'A' : undefined; }
  },
  profilePicture: { 
    type: String, 
    default: '' 
  },
  faceRegistered: {
    type: Boolean,
    default: false
  },
  faceTemplate: {
    type: String,
    default: ''
  },
  phone: { 
    type: String, 
    default: '' 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
