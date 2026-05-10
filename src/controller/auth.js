import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.js";
import User from "../models/user.js";

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);

function signAccessToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    }
  );
}

function createRefreshTokenValue() {
  return crypto.randomBytes(64).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRefreshTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
}

async function createRefreshToken({ user, req, familyId = crypto.randomUUID() }) {
  const refreshToken = createRefreshTokenValue();
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    familyId,
    deviceId: req.headers["x-device-id"] || null,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket?.remoteAddress || "",
    expiresAt: getRefreshTokenExpiryDate()
  });

  return refreshToken;
}

function sendAuthResponse(res, statusCode, user, refreshToken) {
  const accessToken = signAccessToken(user);

  return res.status(statusCode).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      accessToken,
      refreshToken
    }
  });
}

export const registerUser = async (req, res) => {
  try {
    const { email, phone, password, roles } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      email,
      phone,
      password,
      roles: roles?.length ? roles : ["customer"],
      status: "active"
    });

    const refreshToken = await createRefreshToken({ user, req });

    return sendAuthResponse(res, 201, user, refreshToken);

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();

    await user.save();

    const refreshToken = await createRefreshToken({ user, req });

    return sendAuthResponse(res, 200, user, refreshToken);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({ tokenHash })
      .select("+tokenHash")
      .populate("user");

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    const user = storedToken.user;

    if (!user || user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User is not active"
      });
    }

    const newRefreshToken = await createRefreshToken({
      user,
      req,
      familyId: storedToken.familyId
    });

    storedToken.revokedAt = new Date();
    storedToken.replacedByTokenHash = hashToken(newRefreshToken);
    await storedToken.save();

    return sendAuthResponse(res, 200, user, newRefreshToken);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    await RefreshToken.findOneAndUpdate(
      { tokenHash: hashToken(refreshToken), revokedAt: null },
      { revokedAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const logoutAllSessions = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required"
      });
    }

    await RefreshToken.updateMany(
      { user: userId, revokedAt: null },
      { revokedAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: "All sessions logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;

    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.password = password;

    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyToken = async (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      data: req.user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};