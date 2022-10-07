const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controller");
const imageUpload = require("../middleware/image-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/login", usersControllers.login);

router.get("/user/:uid/verify/:emailToken", usersControllers.verifyEmail);

router.post("/user/forgot-password", usersControllers.forgotPassword);

router.patch(
  "/user/:uid/reset-password/:emailToken",
  [check("confirmNewPassword").isLength({ min: 5 })],
  usersControllers.resetPassword
);

router.use(checkAuth);

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getMyProfile);

router.post(
  "/add-user",
  imageUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  usersControllers.addUser
);

router.patch(
  "/:uid",
  imageUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check("confirmNewPassword").isLength({ min: 5 }),
  ],
  usersControllers.updateProfile
);

router.delete("/user/:uid", usersControllers.deleteUser);

module.exports = router;
