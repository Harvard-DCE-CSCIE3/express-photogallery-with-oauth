const express = require('express');
const multer = require('multer');
const photoMiddleware = require("../middleware/photoUpload/upload");
const { requireAuthPage } = require('../middleware/auth');
const photoService = require('../services/photoService');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Import shared multer configuration so upload behavior is centralized.
const {storage, imageFilter, MAX_FILE_SIZE} = photoMiddleware;

// Configure multer for this router:
// - storage: where/how files are saved
// - fileFilter: allowed MIME/file types
// - limits: maximum file size accepted
const upload = multer({ 
  // storage: storage,
  storage: multer.memoryStorage(), // Store files in memory for direct upload to Cloudinary
  fileFilter : imageFilter,
  limits: { fileSize: MAX_FILE_SIZE }  // 5MB limit
});

/* GET gallery - list all photos. */
router.get('/', async function(req, res, next) {
  let photos = [];
  try {
    photos = await photoService.list(); // Use the photoService to fetch all photos from the database. This abstracts away the database logic from the route handler, making it cleaner and more maintainable. The service layer can also handle any necessary data transformations or business logic related to fetching photos, keeping the route handler focused on handling HTTP requests and responses.
  } catch(err) {
    console.error("Error fetching photos from database:", err);
  }
  
  res.render('photos', { 
    title: 'Photo Gallery',
    photos: photos
  });
});

/* GET new photo form. */
router.get('/new', requireAuthPage, function(req, res, next) {
  // Optional one-time flash-like values from session (set by error handlers).
  const error = req.session.error || null;
  delete req.session.error;
  const formData = req.session.formData || {};
  delete req.session.formData;
  
  res.render('addPhoto', {
    title: 'Add New Photo',
    formData: formData,
    error: error
  });
});

/* GET edit form for photo. */
router.get('/:photoid/edit', requireAuthPage, async function(req, res, next) {
  const error = req.session.error || null;
  delete req.session.error;
  const formData = req.session.formData || {};
  delete req.session.formData;
  
  let photo = null;
  try {
    photo = await photoService.find(req.params.photoid);
  } catch(err) {
    console.error("Error fetching photo from database:", err);
  }
  
  if (!photo) {
    return res.redirect('/photos');
  }
  
  res.render('editPhoto', {
    title: 'Edit Photo',
    photo: photo,
    formData: formData,
    error: error
  });
});

/* GET single photo by id. */
router.get('/:photoid', async function(req, res, next) {
  // Route params are strings; convert to number for numeric id matching.
  let photo = null;
  try{
    photo = await photoService.find(req.params.photoid); 
  }catch(err){
    console.error("Error fetching photo from database:", err);
  }

  // Use a fallback page title when no photo matches.
  const photoTitle = photo ? photo.title : 'Photo Not Found';
  
  // Render detail template with the selected photo (or null if not found).
  res.render('photo', {
    title: photoTitle,
    photo: photo
  });
});

/* POST new photo. */
router.post('/', requireAuthPage, upload.single('image'), async function(req, res, next) { 
  // Multer processes multipart form data first; text fields are in req.body,
  // uploaded file metadata is in req.file.
  const photoData  = {
    userId: req.user?._id,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    imageUrl: '', // placeholder until we get the URL back from Cloudinary,
    title: req.body.title,
    filename: req.file.filename,
    description: req.body.description,
    size: req.file.size / 1024 | 0
  }  
  console.log(req.file);
  cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
    try {
      if (error) throw error; // this will trigger the catch block and handle the error by setting session error message and redirecting back to form
      console.log("Result from cloudinary is: ", result)
      photoData.imageUrl = result.secure_url;

      // now create a new photo document and save it to the mongodb database
      await photoService.create(photoData);
    }catch(err){
      console.error("Error saving photo to database:", err);
      req.session.error = "Error saving photo. Please try again.";
      req.session.formData = req.body;
    }
    // Redirect to gallery page
    res.redirect('/photos');
    // cloudinary.uploader.upload_stream returns a writable stream that we can write the file buffer to, which triggers the upload to cloudinary. 
    // We call .end() to signal that we're done writing to the stream after writing the file buffer.
    // This works similarly to how we used response.end() to send an HTTP response in raw Node HTTP server examples, but here we're writing to a stream provided by the Cloudinary library rather than the HTTP response stream provided by Node.
  }).end(req.file.buffer);   

});

/* POST update photo by id. */
router.post('/:photoid', requireAuthPage, async function(req, res, next) {
  try {
    const updatedPhoto = await photoService.update(
      req.params.photoid,
      {
        title: req.body.title,
        description: req.body.description,
        updatedAt: new Date()
      },
      { new: true } // Return updated document
    );
    
    if (!updatedPhoto) {
      req.session.error = "Photo not found.";
      return res.redirect('/photos');
    }
    
    // Redirect to detail page after successful update
    res.redirect(`/photos/${req.params.photoid}`);
  } catch(err) {
    console.error("Error updating photo:", err);
    req.session.error = "Error updating photo. Please try again.";
    req.session.formData = req.body;
    res.redirect(`/photos/${req.params.photoid}/edit`);
  }
});

/* POST delete photo by id. */
router.post('/:photoid/delete', requireAuthPage, async function(req, res, next) {
  try {
    const photo = await photoService.find(req.params.photoid);
    
    if (photo) {
      // Delete file from disk
      /*const filePath = path.join(__dirname, '..', 'public', photo.imageUrl);
      console.log("Deleting file at path:", filePath);
      try {
        await fs.unlink(filePath);
      } catch(fileErr) {
        console.error("Error deleting file from disk:", fileErr);
        // Continue with database deletion even if file deletion fails
      }
      */
      // Delete from database
      await photoService.remove(req.params.photoid);
    }
    
    res.redirect('/photos');
  } catch(err) {
    console.error("Error deleting photo:", err);
    req.session.error = "Error deleting photo. Please try again.";
    res.redirect(`/photos/${req.params.photoid}`);
  }
});

// Router-scoped error handler for upload-related errors.
// Handles multer size errors + custom invalid type errors from imageFilter.
router.use(function(err, req, res, next){
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE'){
    req.session.error = 'File too large. Maximum file size is 5MB.'; 
    req.session.formData = req.body;  
    res.redirect('/photos/new');
  } else if (err.message === 'InvalidImageType'){
      req.session.error = 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.';
      req.session.formData = req.body;   
      res.redirect('/photos/new');
  } else {
    // Delegate unknown errors to higher-level app error handling.
    next(err);
  }
});

module.exports = router;

