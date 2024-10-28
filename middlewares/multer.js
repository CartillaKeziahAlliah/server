const multer = require("multer");
const path = require("path");

// Storage configuration for both profile pictures and PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";
    if (file.fieldname === "avatar") {
      folder = "uploads/profile_pictures";
    } else if (file.fieldname === "discussion") {
      folder = "uploads/discussions"; // Folder for discussion PDFs
    } else {
      return cb(new Error("Invalid file field name"));
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Upload configuration for profile pictures
const uploadProfilePicture = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
});

// Upload configuration for discussion PDFs
const discussion = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit for PDFs
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only PDFs are allowed!"));
    }
  },
});

module.exports = {
  uploadProfilePicture,
  discussion,
};
