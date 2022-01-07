const express = require('express'),
      path = require('path'),
      mongoose = require('mongoose'),
      methodOverride = require('method-override'),
      ejsMate = require('ejs-mate'),
      app = express(),
      db = mongoose.connection,
      ExpressError = require('./utils/ExpressError'),
      catchAsync = require('./utils/catchAsync'),
      Campground = require('./models/campground'),
      { campgroundSchema } = require('./schemas');

mongoose.connect('mongodb://localhost:27017/yelpCamp');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}))

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground.id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})
      
app.listen(3000, () => {
    console.log('Listening on Port 3000');
})