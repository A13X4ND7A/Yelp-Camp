const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const campground = require('./models/campground');

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


//NOTE TO SELF, THE ORDER OF THESE ROUTES CAN MATTER!!!!!!!!

app.get('/', (req, res) => {
    res.render('home')
});

app.get("/campgrounds", async (req, res) => {
 const campgrounds = await Campground.find({}); // finds all the campgrounds
 res.render('campgrounds/index', { campgrounds }) //renders a list of all the campgrounds on the index page
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new'); //renders the page for the new campground
});

app.post('/campgrounds', async (req,res) => {
    const campground = new Campground(req.body.campground)//addns the new campground to the db
    await campground.save(); //saves the new campground to the db
    res.redirect(`/campgrounds/${campground._id}`)//redirects is to the campground id that was just created
})
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id); //find the campground by the id
    res.render('campgrounds/show', { campground }); //outputs the campground specific on the show page

});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id); //find the campground by the id
  res.render("campgrounds/edit", { campground }); //outputs the campground specific to be edited
});

app.put('/campgrounds/:id', async(req,res) => {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.listen(3000, () => {
    console.log('running on port 3000');
});