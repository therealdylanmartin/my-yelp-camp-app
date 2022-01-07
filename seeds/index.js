const mongoose = require('mongoose'),
      db = mongoose.connection,
      cities = require('./cities'),
      { descriptors, places } = require('./seedHelpers'),
      Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelpCamp');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany();
    for(let i = 0; i < 50; i++) {
        const randomOf1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40);
        const camp = new Campground({
            location: `${cities[randomOf1000].city}, ${cities[randomOf1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus, cumque? Ad, eaque modi, vitae est suscipit molestiae illo, perferendis nulla laboriosam adipisci neque alias nesciunt incidunt quidem aspernatur ipsa animi?',
            price
        })
        await camp.save();
    }
}

seedDB()
    .then(p => {
        db.close();
    })
    .catch(e => {
        console.log('Problems closing database connection');
        console.log(e.errors);
})