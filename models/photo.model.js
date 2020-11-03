const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: {
    type: String,
    required: true
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true
  } }
)

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;