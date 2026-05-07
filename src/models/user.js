import mongoose from "mongoose";
import bcrypt from "bcrypt"
const USER_ROLES = ["customer", "admin", "seller", "support"];
const USER_STATUS = ["active", "inactive", "blocked", "pendingVerification"];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    roles: {
      type: [String],
      enum: USER_ROLES,
      default: ["customer"]
    },
    status: {
      type: String,
      enum: USER_STATUS,
      default: "pendingVerification"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      min: 0,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

userSchema.index({ roles: 1, status: 1 });
userSchema.pre('save', async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordChangedAt = new Date();
});
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password,this.password);
}

const User = mongoose.model("User", userSchema);

export default User;