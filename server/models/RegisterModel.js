var mongoose = require("mongoose");

var RegisterSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: false,
  },
  confirmed: {
    type: Number,
    required: true,
  },
  deaths: {
    type: Number,
    required: true,
  },
});

var Register = mongoose.model("Register", RegisterSchema, "jhudata");

module.exports = Register;
