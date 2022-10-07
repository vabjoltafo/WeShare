const express = require("express");
const { check } = require("express-validator");

const filesControllers = require("../controllers/files-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();
router.get("/download/:fid", filesControllers.downloadFile);
router.use(checkAuth);

router.get("/all", filesControllers.getFiles);

router.get("/:fid", filesControllers.getFileById);

router.get("/user/:uid", filesControllers.getFilesByUserId);

router.post(
  "/",
  fileUpload.single("file"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  filesControllers.createFile
);

router.patch(
  "/:fid",
  fileUpload.single("file"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  filesControllers.updateFile
);

router.delete("/:fid", filesControllers.deleteFile);

module.exports = router;
