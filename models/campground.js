const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
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
	},
	opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
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
