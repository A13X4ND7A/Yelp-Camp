const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const Review = require('../models/review');
const Campground = require('../models/campground');

router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created new review!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//DELETES THE REVIEWS. THE PULL METHOD FROM MONGO ALLOWS YOU TO FIND THE REVIEW INSTANCES WITHIN THE CAMPGROUND THAT CORELATES TO THE REVIEW BEING DELETED AND WILL DELETE THAT FROM THE ARRAY.
router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res) => {
		const {id, reviewId} = req.params;
		await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Successfully deleted review');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
