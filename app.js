const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

const { campgroundSchema, reviewSchema } = require('./schemas.js');

const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews.js');

//CONNECTING TO THE DATABASE
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

//OPENING A CONNECTION AND ADDRESSING IF CONNECTED OR ERROR
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
	console.log('Database Connected!');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); //SETS THE DEFAULT DIRECTORY FOR PAGES TO VIEWS

app.use(
	express.urlencoded({
		extended: true,
	})
); //ALLOWS US TO PARSE THE DATA FROM A POST REQUEST AND DISPLAY
app.use(methodOverride('_method')); // ALLOWS YOU TO USE EXTRA HTTP VERBS
app.use(express.static(path.join(__dirname, 'public')));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveuninitialized: true,
};
app.use(session(sessionConfig));

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'oh no something went wrong';
	res.status(statusCode).render('error', {
		err,
	});
});

app.listen(3000, () => {
	console.log('running on port 3000');
});
