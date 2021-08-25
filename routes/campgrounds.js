const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn} = require('../middleware');

const {campgroundSchema} = require('../schemas.js');

const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
	const {error} = campgroundSchema.validate(req.body);
	if (error) {
		//map over the errors and make a single string message
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({}); // finds all the campgrounds
		res.render('campgrounds/index', {
			campgrounds,
		}); //renders a list of all the campgrounds on the index page
	})
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new'); //renders the page for the new campground
});

router.post(
	'/',
	validateCampground,
	isLoggedIn,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', 'Successfully made a new campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate('reviews'); //find the campground by the id and populate reviews
		if (!campground) {
			req.flash('error', 'Cannot find campground');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', {
			campground,
		}); //outputs the campground specific on the show page
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id); //find the campground by the id
		if (!campground) {
			req.flash('error', 'Cannot find campground');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', {
			campground,
		});
	})
);

//A PUT REQUEST (METHOD-OVERRIDE ALLOWS US TO USE THIS) TO FIND THE REQUIRED CAMPGROUND AND UPDATE IT.
router.put(
	'/:id',
	validateCampground,
	isLoggedIn,
	catchAsync(async (req, res) => {
		const {id} = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', 'sucessfully updated campground');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//ALLOWS THE USER TO DELETE THE CAMPGROUND AND REDIRECTS BACK TO THE MAIN ALL CAMPGROUNDS PAGE
router.delete(
	'/:id',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const {id} = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'successfully deleted a campground');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
