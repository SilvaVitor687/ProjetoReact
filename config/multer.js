const multer = require("multer");

const storage = multer.discStorage({
    destination: (req, file, callback) =>(null, __dirname + '/../public/images'),
    filename: (req, file, callback) =>(null, file.fieldname + '-' + Date.now() + '.jpg'),
});

const upload = multer({ storage });

module.exports = upload;