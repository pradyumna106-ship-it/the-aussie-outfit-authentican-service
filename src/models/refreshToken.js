import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },
    familyId: {
      type: String,
      required: true,
      index: true
    },
    deviceId: {
      type: String,
      trim: true,
      default: null
    },
    userAgent: {
      type: String,
      trim: true,
      default: ""
    },
    ipAddress: {
      type: String,
      trim: true,
      default: ""
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    replacedByTokenHash: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true,
    collection: "refreshTokens"
  }
);

refreshTokenSchema.index({ user: 1, familyId: 1 });


const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;