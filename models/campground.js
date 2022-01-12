const mongoose = require('mongoose'),
      Review = require('./review'),
      Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_135');
})

const options = { toJSON: { virtuals: true } };
    
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: 'Point',
            required: true
        },
        coordinates: {
            type: [ Number ],
            required: true
        }
    },
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options);

CampgroundSchema.virtual('properties.popUpText').get(function() {
    return `<h4><a href="/campgrounds/${this._id}">${this.title}</a></h4><h5>${this.location}</h5>`;
})

CampgroundSchema.post('findOneAndDelete', async function(campground) {
    if(campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);