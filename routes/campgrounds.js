const express = require('express');
const router = express.Router();
const campgrounds = require('../../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const Campground = require('../models/campground');

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id') //route allows us to use a single route to use different verbs
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) //use method override to allow the use of put
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //check if user is logged in and is the correct user to enable them to delete

module.exports = router;
