const Campground = require('../models/campground'),
      { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}

module.exports.create = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user.id;
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.show = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user.id)) {
        req.flash('error', 'You can\'t edit this campground!');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    if(req.files) {
        const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));
        campground.images.push(...imgs);
    }
    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.delete = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Campground has been deleted!');
    res.redirect('/campgrounds');
}