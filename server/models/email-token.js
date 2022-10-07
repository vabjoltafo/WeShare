const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const emailTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
    unique: true
  },
  emailToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 36000},
})

module.exports = mongoose.model("EmailToken", emailTokenSchema);