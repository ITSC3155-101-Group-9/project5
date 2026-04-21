"use strict";

const mongoose = require("mongoose");

/**
 * Mongoose schema for User.
 */
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,
  login_name: String,
  password: String,
});

userSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
