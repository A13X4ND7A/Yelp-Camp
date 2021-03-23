const mongoose = require("mongoose");
const cities = require('./cities.js')
const { places, descriptors } = require('./seedHelpers');
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database Connected!");
});

//get a random place and a random descriptor from the arrays.
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0; i< 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
          location: `${cities[random1000].city}, ${cities[random1000].state} `,
          title: `${sample(descriptors)} ${sample(places)}`,
          image: 'https://source.unsplash.com/collection/483251',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam, libero. Magni error quam optio qui aut necessitatibus consequatur doloremque veniam minus dicta, corporis quasi accusantium similique, eos aspernatur ex nobis.',
          price
        });
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})