const Joi = require('joi');

module.exports.campgroundSchema = Joi.object ({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object ({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required()
    }).required()
})

module.exports.userSchema = Joi.object ({
    user: Joi.object({
        email: Joi.string().required().email(),
        username: Joi.string().required().min(6).max(20),
        password: Joi.string().required().min(8)
    }).required()
})