const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/review');
const Campground = require('../models/campground');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	console.log(error);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', "You've sucessfullly created a new review");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//DELETES THE REVIEWS. THE PULL METHOD FROM MONGO ALLOWS YOU TO FIND THE REVIEW INSTANCES WITHIN THE CAMPGROUND THAT CORELATES TO THE REVIEW BEING DELETED AND WILL DELETE THAT FROM THE ARRAY.
router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, {
			$pull: {
				reviews: reviewId,
			},
		});
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'sucessfully deleted review!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
