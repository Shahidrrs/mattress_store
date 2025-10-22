const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
      type: String, 
      required: true 
      // NOTE: We do NOT use 'select: false' here to ensure the password
      // is available for comparison during login.
  },
  
  // REQUIRED for password reset functionality
  resetPasswordToken: String,
  resetPasswordExpires: Date 
}, {
    timestamps: true
});

// PRE-SAVE HOOK: This logic is designed to be robust for ALL scenarios:
// 1. New Signup: Hashes plaintext password.
// 2. Profile Update: Skips hashing if password hasn't changed.
// 3. Password Reset: Skips hashing because the server already hashed it before calling save.
userSchema.pre("save", async function (next) {
  // 1. If the password field has not been changed, move on. (Handles profile updates)
  if (!this.isModified("password")) {
    return next();
  }
  
  // 2. If the password already looks like a hash (starts with '$2b$'), skip hashing. 
  // This prevents double-hashing when saving a pre-hashed password from the reset route.
  if (this.password.startsWith('$2b$')) {
    return next();
  }
  
  // 3. Otherwise, hash the plaintext password (for new signups).
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
