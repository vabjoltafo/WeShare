const fs = require("fs");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const File = require("../models/file");
const User = require("../models/user");
const { mongoose } = require("mongoose");

const getFiles = async (req, res, next) => {
  let files;
  try {
    files = await File.find({})
      .sort({ timestamps: -1 })
      .populate({ path: "creator", select: "name _id" });
  } catch (err) {
    return next(new HttpError("Failed to fetch users!", 500));
  }

  res.json({ files: files.map((file) => file.toObject({ getters: true })) });
};

const getFileById = async (req, res, next) => {
  const fileId = req.params.fid;

  let filePost;
  try {
    filePost = await File.findById(fileId);
  } catch (err) {
    const error = new HttpError("Something went wrong!", 500);
    return next(error);
  }

  if (!filePost) {
    return next(
      new HttpError("Could not find a file for the provided id.", 404)
    );
  }

  res.json({ filePost: filePost.toObject({ getters: true }) });
};

const getFilesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let filePosts;
  try {
    filePosts = await File.find({ creator: userId }).populate({ path: "creator", select: "name _id" }).sort({ timestamps: -1 });
  } catch (err) {
    return next(new HttpError("Fetching failed, please try again.", 500));
  }

  const userInfo = await User.findById(userId, "-password");

  if (!filePosts) {
    return next(
      new HttpError("Could not find files for the provided user id.", 404)
    );
  }

  res.json({
    userInfo: userInfo.toObject({ getters: true }),
    filePosts: filePosts.map((file) => file.toObject({ getters: true })),
  });
};

const createFile = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed, please check you data!", 422)
    );
  }

  const { title, description, creator } = req.body;
  const createdFile = new File({
    title,
    description,
    file: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating file failed, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for the provided id.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdFile.save();
    user.files.push(createdFile);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating file failed.", 500));
  }

  res.status(201).json(createdFile);
};

const downloadFile = async (req, res, next) => {
  const fileId = req.params.fid;
  let filePost;
  try {
    filePost = await File.findById(fileId);
  } catch (err) {
    return next(new HttpError("Error", 500));
  }
  res.download(filePost.file);
};

const updateFile = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed, please check you data!", 422)
    );
  }

  const { title, description } = req.body;
  const fileId = req.params.fid;

  let filePost;
  try {
    filePost = await File.findById(fileId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update!", 500));
  }

  let isAdmin = false;
  if (req.userData.userRole === "admin") {
    isAdmin = true;
  } else if (req.userData.userRole !== "admin") {
    isAdmin = false;
  }

  if (!isAdmin && filePost.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to update!", 401));
  }
  filePost.title = title;
  filePost.description = description;
  if (req.file) {
    filePost.file = req.file.path;
  }

  try {
    await filePost.save();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  res.status(200).json({ filePost: filePost.toObject({ getters: true }) });
};

const deleteFile = async (req, res, next) => {
  const fileId = req.params.fid;

  let filePost;
  try {
    filePost = await File.findById(fileId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete file.", 500)
    );
  }

  if (!filePost) {
    return next(new HttpError("File does not exists.", 404));
  }

  let isAdmin = false;
  if (req.userData.userRole === "admin") {
    isAdmin = true;
  } else if (req.userData.userRole !== "admin") {
    isAdmin = false;
  }

  if (!isAdmin && filePost.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete!", 401));
  }

  const filePath = filePost.file;

  try {
    await filePost.remove();
    filePost.creator.files.pull(filePost);
    await filePost.creator.save();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete file."));
  }

  fs.unlink(filePath, (err) => {});

  res.status(200).json({ message: "Deleted file." });
};

module.exports = {
  getFiles,
  getFileById,
  getFilesByUserId,
  createFile,
  downloadFile,
  updateFile,
  deleteFile,
};
