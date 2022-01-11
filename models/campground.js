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
    
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
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