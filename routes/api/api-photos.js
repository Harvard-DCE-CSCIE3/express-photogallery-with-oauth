const express = require('express');
const multer = require('multer');
const { requireAuthApi } = require('../../middleware/auth');
const photoMiddleware = require('../../middleware/photoUpload/upload');
const photoService = require('../../services/photoService');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

const { imageFilter, MAX_FILE_SIZE } = photoMiddleware;

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

// list
router.get('/', async (req, res, next) => {
  try {
    const photoList = await photoService.list();
    return res.status(200).json(photoList);
  } catch (err) {
    next(err);
  }
});

// find
router.get('/:photoid', async (req, res, next) => {
  try {
    const photo = await photoService.find(req.params.photoid);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    return res.status(200).json(photo);
  } catch (err) {
    next(err);
  }
});

// create
router.post('/', requireAuthApi, upload.single('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const photoData = {
    userId: req.user?._id,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    imageUrl: '',
    title: req.body.title,
    description: req.body.description,
    size: req.file.size / 1024 | 0
  };

  cloudinary.uploader
    .upload_stream({ resource_type: 'image' }, async (error, result) => {
      try {
        if (error) {
          throw error;
        }

        photoData.imageUrl = result.secure_url;
        const createdPhoto = await photoService.create(photoData);
        return res.status(201).json(createdPhoto);     // response code 201: Created
      } catch (err) {
        return next(err);
      }
    })
    .end(req.file.buffer);
});

// update
router.put('/:photoid', requireAuthApi, async (req, res, next) => {
  try {
    const updatedPhoto = await photoService.update(req.params.photoid, {
      title: req.body.title,
      description: req.body.description,
      updatedAt: new Date()
    });

    if (!updatedPhoto) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    return res.status(200).json(updatedPhoto);
  } catch (err) {
    next(err);
  }
});

// delete
router.delete('/:photoid', requireAuthApi, async (req, res, next) => {
  try {
    const deletedPhoto = await photoService.remove(req.params.photoid);

    if (!deletedPhoto) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    return res.status(200).json(deletedPhoto);
  } catch (err) {
    next(err);
  }
});

// Router-level error handling for common API errors.
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum file size is 5MB.' });
  }

  if (err.message === 'InvalidImageType') {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;
