const multer = require("multer");

const FILE_TYPE_MAP = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/msword': 'docx'
}

const fileUpload = multer({
  limits: 1000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/files');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname.replace(/\s/g, ""));
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!FILE_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
