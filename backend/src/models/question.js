const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quiz: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true, 
    index: true 
  },
  text: { 
    type: String, 
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    validate: {
      validator: function(val) {
        return val.length >= 2;
      },
      message: 'Question must have at least 2 options'
    },
    required: true
  },
  correctAnswerIndex: { 
    type: Number, 
    required: [true, 'Correct answer index is required'],
    validate: {
      validator: function(val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'Correct answer index must correspond to options array'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
