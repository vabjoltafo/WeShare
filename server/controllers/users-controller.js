const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const EmailToken = require("../models/email-token");
const sendEmail = require("../middleware/send-email");
const File = require("../models/file");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password").sort({ timestamps: -1 });
  } catch (err) {
    return next(new HttpError("Failed to fetch users!", 500));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getMyProfile = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    return next(new HttpError("Could not find the user.", 500));
  }

  res.json({ user });
};

const addUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check you data!", 422)
    );
  }

  const { name, email, password, role } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Could not add the user, please try again.", 500)
    );
  }

  if (existingUser) {
    return next(new HttpError("User exists already.", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user.", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file ? req.file.path : "../uploads/images/defaultUserImage.png",
    files: [],
    role,
    verified: false,
  });

  const emailToken = new EmailToken({
    userId: createdUser._id,
    emailToken: uuidv4(),
  });
  const url = `http://localhost:3000/users/user/${createdUser._id}/verify/${emailToken.emailToken}`;

  try {
    await createdUser.save();
    await emailToken.save();
    await sendEmail(createdUser.email, "Verify email", url);
  } catch (err) {
    return next(new HttpError("Creating user failed.", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.uid });
    if (!user) {
      return next(new HttpError("Invalid link!", 400));
    }
    const emailToken = await EmailToken.findOne({
      userId: user._id,
      emailToken: req.params.emailToken,
    });

    if (!emailToken) {
      return next(new HttpError("Invalid token!", 400));
    }
    await User.updateOne({ _id: user._id }, { verified: true });
    await emailToken.remove();

    return next(new HttpError("Email sent successfully!", 200));
  } catch (error) {
    return next(new HttpError("Internal server error!", 500));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }

  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Could not log you in!", 500));
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403)
    );
  }

  if (!existingUser.verified) {
    return next(new HttpError("User is not verified!", 403));
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        userRole: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed!", 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    userRole: existingUser.role,
    token: token,
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Resetting password failed, please try again.", 500)
    );
  }

  if (!existingUser) {
    return next(new HttpError("Invalid email.", 403));
  }

  const emailToken = new EmailToken({
    userId: existingUser._id,
    emailToken: uuidv4(),
  });
  const url = `http://localhost:3000/users/user/${existingUser._id}/reset-password/${emailToken.emailToken}`;

  try {
    await emailToken.save();
    await sendEmail(existingUser.email, "Reset password", url);
    return next(new HttpError("Email sent. Please check your inbox.", 200));
  } catch (err) {
    return next(new HttpError("Sending email failed.", 500));
  }
};

const resetPassword = async (req, res, next) => {
  const { newPassword, confirmNewPassword } = req.body;

  let user;
  let emailToken;
  try {
    user = await User.findOne({ _id: req.params.uid });
    if (!user) {
      return next(new HttpError("Invalid link!", 400));
    }

    emailToken = await EmailToken.findOne({
      userId: user._id,
      emailToken: req.params.emailToken,
    });
    if (!emailToken) {
      return next(new HttpError("Invalid token!", 400));
    }
  } catch (error) {
    return next(
      new HttpError("Internal server error! Could not reset password.", 500)
    );
  }

  let hashedNewPassword;
  if (newPassword !== confirmNewPassword) {
    return next(
      new HttpError(
        "Please write the same password on the New Password and Confirm Password fields!",
        403
      )
    );
  } else {
    try {
      hashedNewPassword = await bcrypt.hash(confirmNewPassword, 12);
    } catch (err) {
      console.log(err);
      return next(new HttpError("Could not hash password.", 500));
    }
  }

  user.password = hashedNewPassword;

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const updateProfile = async (req, res, next) => {
  const {
    name,
    email,
    role,
    currentPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;
  const userId = req.params.uid;

  let userData;
  try {
    userData = await User.findById(userId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update!", 500));
  }

  let isAdmin = false;
  if (req.userData.userRole === "admin") {
    isAdmin = true;
  } else if (req.userData.userRole !== "admin") {
    isAdmin = false;
  }

  if (!isAdmin && userId !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete!", 401));
  }

  userData.name = name;
  userData.email = email;
  userData.role = role;

  if (Object.keys(req.body).includes("confirmNewPassword")) {
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(
        currentPassword,
        userData.password
      );
    } catch (err) {
      return next(new HttpError("Something went wrong!"), 500);
    }

    if (!isValidPassword) {
      return next(new HttpError("Wrong password!"), 403);
    }

    let hashedNewPassword;
    if (newPassword !== confirmNewPassword) {
      return next(
        new HttpError(
          "Please write the same password on the New Password and Confirm Password fields!",
          403
        )
      );
    } else {
      try {
        hashedNewPassword = await bcrypt.hash(confirmNewPassword, 12);
      } catch (err) {
        return next(new HttpError("Could not change password.", 500));
      }
    }

    userData.password = hashedNewPassword;
  }

  if (Object.keys(req.body).includes("image")) {
    userData.image = req.body.image;
  } else if (Object.keys(req.file).includes("path")) {
    userData.image = req.file.path;
  }

  try {
    await userData.save();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  res.status(200).json({ userData: userData.toObject({ getters: true }) });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete user.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("User does not exists.", 400));
  }

  let files;
  try {
    files = await File.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("No files found.", 400));
  }

  let isAdmin = false;
  if (req.userData.userRole === "admin") {
    isAdmin = true;
  } else if (req.userData.userRole !== "admin") {
    isAdmin = false;
  }

  if (!isAdmin && userId !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete!", 401));
  }

  const userImagePath = user.image;

  try {
    files.map(async (file) => {
      await file.remove();
    });
    await user.remove();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  files.map((file) => {
    filePath = file.file;
    fs.unlink(filePath, (err) => {});
  });
  fs.unlink(userImagePath, (err) => {});

  res.status(200).json({ message: "Deleted user." });
};

module.exports = {
  getUsers,
  getMyProfile,
  addUser,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteUser,
};
