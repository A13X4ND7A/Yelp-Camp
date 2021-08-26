const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
	title: String,
	image: String,
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
});

//CHECKS THE MIDDLEWARE FUNCTION FIND ONE AND DELETE, LOOKS IN THE DOC FOR THAT FUNCTION ON THE CAMPGROUND AND REMOVES THE REVIEWS THAT ARE WITHIN THAT CAMPGROUNDS ID THAT IS BEING DELETED. THIS MEANS THAT ALL OF THE REVIEWS ASSOCIATED WITH THAT CAMPGROUND ARE DELETED AND NOT JUST LEFT IN THE REVIEWS TABLE.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);
