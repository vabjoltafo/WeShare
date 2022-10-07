const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  timestamps: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);