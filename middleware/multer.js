const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    const fieldName = file.fieldname || "file";
    const extension = file.originalname.split(".").pop();
    callback(null, `${fieldName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
