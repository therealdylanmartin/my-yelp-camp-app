const express = require('express'),
      router = express.Router(),
      multer = require('multer'),
      { storage } = require('../cloudinary'),
      upload = multer({ storage }),
      campgrounds = require('../controllers/campgrounds'),
      catchAsync = require('../utils/catchAsync'),
      { validateCampground, isLoggedIn, isAuthor } = require('../middleware');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('campground[images]'), validateCampground, catchAsync(campgrounds.create));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array('campground[images]'), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;