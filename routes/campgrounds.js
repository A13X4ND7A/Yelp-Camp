const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const Campground = require('../models/campground');

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({}); // finds all the campgrounds
		res.render('campgrounds/index', {campgrounds}); //renders a list of all the campgrounds on the index page
	})
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new'); //renders the page for the new campground
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Successfully made a new campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path: 'reviews',
				populate: {
					path: 'author',
				},
			})
			.populate('author');
		console.log(campground);
		if (!campground) {
			req.flash('error', 'Cannot find that campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', {campground});
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const {id} = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash('error', 'Cannot find that campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', {campground});
	})
);

//A PUT REQUEST (METHOD-OVERRIDE ALLOWS US TO USE THIS) TO FIND THE REQUIRED CAMPGROUND AND UPDATE IT.
router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res) => {
		const {id} = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
		req.flash('success', 'Successfully updated campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//ALLOWS THE USER TO DELETE THE CAMPGROUND AND REDIRECTS BACK TO THE MAIN ALL CAMPGROUNDS PAGE
router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const {id} = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted campground');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
