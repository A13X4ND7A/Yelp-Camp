const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');



//CONNECTING TO THE DATABASE
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

//OPENING A CONNECTION AND ADDRESSING IF CONNECTED OR ERROR
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) //SETS THE DEFAULT DIRECTORY FOR PAGES TO VIEWS
app.use(express.urlencoded({extended: true})); //ALLOWS US TO PARSE THE DATA FROM A POST REQUEST AND DISPLAY 
app.use(methodOverride('_method')); // ALLOWS YOU TO USE EXTRA HTTP VERBS 


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        //map over the errors and make a single string message
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
    }else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});

app.get("/campgrounds", catchAsync(async (req, res) => {
 const campgrounds = await Campground.find({}); // finds all the campgrounds
 res.render('campgrounds/index', { campgrounds }) //renders a list of all the campgrounds on the index page
}));

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new'); //renders the page for the new campground
});

app.post(
  "/campgrounds",
  validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)

    const campground = new Campground(req.body.campground);
    await campground.save(); //saves the new campground to the db
    res.redirect(`/campgrounds/${campground._id}`); //redirects is to the campground id that was just created
  })
);

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); //find the campground by the id
    res.render('campgrounds/show', { campground }); //outputs the campground specific on the show page

}));



app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id); //find the campground by the id
  res.render("campgrounds/edit", { campground }); //outputs the campground specific to be edited
}));

//A PUT REQUEST (METHOD-OVERRIDE ALLOWS US TO USE THIS) TO FIND THE REQUIRED CAMPGROUND AND UPDATE IT.
app.put(
  "/campgrounds/:id",
  validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//ALLOWS THE USER TO DELETE THE CAMPGROUND AND REDIRECTS BACK TO THE MAIN ALL CAMPGROUNDS PAGE
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post("/campgrounds/:id/reviews/",catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'oh no something went wrong'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('running on port 3000');
});