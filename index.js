const mongoose = require('mongoose'),
      db = mongoose.connection,
      { createApi } = require('unsplash-js'),
      unsplashAccessKey = 'Ud66IOUGcl8ud_d0w_dGua54EhLtO4Z9E54ehiQsPY0',
      fetch = require('node-fetch'),
      mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'),
      mapBoxToken = 'pk.eyJ1IjoidGhlcmVhbGR5bGFubWFydGluIiwiYSI6ImNreTlhZXFlejA0aXgycG81dmRyMWFzdzUifQ.Dx2J8YcgQ9aYR9Ay8jQpCQ',
      geocodingClient = mbxGeocoding({ accessToken: mapBoxToken }),
      cities = require('./cities'),
      { descriptors, places } = require('./seedHelpers'),
      Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelpCamp');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const unsplash = createApi({
  accessKey: unsplashAccessKey,
  fetch
})

const getCampgroundImages = async () => {
    return await unsplash.photos.getRandom({
        collectionIds: [ '483251' ],
        count: 50
    })
}

const seedDB = async () => {
    await Campground.deleteMany();
    for(let i = 0; i < 50; i++) {
        const randomOf1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40);
        const campground = new Campground({
            author: '61db5068ea6f71b2af4ab686',
            location: `${cities[randomOf1000].city}, ${cities[randomOf1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                { 
                    url: `${campgroundImages.response[i].urls.full}&fit=crop&w=800&h=640`,
                    filename: `${campgroundImages.response[i].urls.full}&fit=crop&w=800&h=640`.replace('https://images.unsplash.com/','')
                }
            ],
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus, cumque? Ad, eaque modi, vitae est suscipit molestiae illo, perferendis nulla laboriosam adipisci neque alias nesciunt incidunt quidem aspernatur ipsa animi?',
            price
        })
        const geoData = await geocodingClient.forwardGeocode({
            query: campground.location,
            limit: 1
        }).send()
        campground.geometry = geoData.body.features[0].geometry;
        await campground.save();
    }
}

let campgroundImages;

getCampgroundImages()
    .then((images) => {
        return campgroundImages = images;
    })
    .then(() => {
        seedDB()
            .then(p => {
                db.close();
            })
            .catch(e => {
                console.log('Problems closing database connection');
                console.log(e.errors);
        })
    })