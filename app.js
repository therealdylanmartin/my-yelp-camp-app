if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express'),
      path = require('path'),
      mongoose = require('mongoose'),
      mongoSanitize = require('express-mongo-sanitize'),
      ejsMate = require('ejs-mate'),
      session = require('express-session'),
      MongoStore = require('connect-mongo'),
      flash = require('connect-flash'),
      methodOverride = require('method-override'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      ExpressError = require('./utils/ExpressError'),
      User = require('./models/user'),
      userRoutes = require('./routes/users'),
      campgroundRoutes = require('./routes/campgrounds'),
      reviewRoutes = require('./routes/reviews');

let dbUrl = process.env.DB_URL;
if(process.env.NODE_ENV !== 'production') {
    dbUrl = 'mongodb://localhost:27017/yelpCamp';
}

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected on 3000");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));

const secret = process.env.SESSION_SECRET;

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', (e) => {
    console.log('Store Error', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
    
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

let port = process.env.PORT;
if(process.env.NODE_ENV !== 'production') {
    port = 3000;
}
      
app.listen(port, () => {
    console.log(`Serving on Port ${port}`);
})