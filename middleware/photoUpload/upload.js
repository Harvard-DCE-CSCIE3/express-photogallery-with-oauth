const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024; //5 MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +  file.originalname   );
  }
});

const imageFilter = function(req, file, cb){
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('InvalidImageType'), false);
  }
  cb(null, true);
}

module.exports.storage = storage;
module.exports.imageFilter = imageFilter;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;