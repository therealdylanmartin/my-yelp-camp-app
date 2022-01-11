const Review = require('../models/review'),
      Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user.id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'You left a new review!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash('success', 'Review has been removed!');
    res.redirect(`/campgrounds/${id}`);
}