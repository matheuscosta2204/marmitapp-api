const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const { checkCNPJ } = require('../../helper/util');

const Restaurant = require('../../models/restaurant');
const User = require('../../models/User');

// @route   GET api/restaurant/
// @desc    get all restaurants
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.send(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/restaurant/:id
// @desc    get restaurant by id
// @access  Public
router.get('/current', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ _id: req.user.id });

        if(!restaurant) {
            return res.status(500).json({ msg: 'There is no restaurant for this user' });
        }

        res.send(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/restaurant/filter/:page/:limit
// @desc    get restaurants without filter but with pagination
// @access  Public
router.get('/filter/:page/:limit', async (req, res) => {
    try {
        const { page, limit } = req.params;
        const restaurants = await Restaurant.find()
                                            .skip((Number(limit) * page) - Number(limit))
                                            .limit(Number(limit));
        res.send(restaurants);
    } catch (err) {
        res.status(500).send(err);
    }
});

// @route   GET api/restaurant/filter/:filter/:page/:limit
// @desc    get restaurants with filter and pagination
// @access  Public
router.get('/filter/:filter/:page/:limit', async (req, res) => {
    try {
        const { filter, page, limit } = req.params;
        const restaurants = await Restaurant.find({ name: { $regex: '.*' + filter + '.*', $options: 'i' } })
                                            .skip((Number(limit) * page) - Number(limit))
                                            .limit(Number(limit));
        res.send(restaurants);
    } catch (err) {
        res.status(500).send(err);
    }
});

// @route   GET api/restaurant/filter/:filter
// @desc    get restaurants with filter
// @access  Public
router.get('/filter/:filter', async (req, res) => {
    try {
        const { filter } = req.params;
        const restaurants = await Restaurant.find({ $or:[{ name: { $regex: '.*' + filter + '.*', $options: 'i' } }, { address: { $regex: '.*' + filter + '.*', $options: 'i' } }] });
        
        const response = restaurants.map(restaurant => { 
            return { name: restaurant.name, address: restaurant.address }  
        });

        res.send(response);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/restaurant/favorites/:page/:limit
// @desc    get favorites restaurants of a user
// @access  Public
router.get('/favorites', auth, async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findOne({ _id: id });
        const restaurants = await Restaurant.find({ _id: { $in: user.favorites }});

        res.send(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/restaurant/
// @desc    register new restaurant
// @access  Public
router.post(
    '/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('cnpj', 'Please include a valid CNPJ').not().isEmpty().custom(value => checkCNPJ(value)),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, cnpj, email, password } = req.body;

        try {

            let restaurant = await Restaurant.findOne({ $or:[{ cnpj }, { name }, { email }] });

            if (restaurant) {
                return res.status(400).json({ errors: [{ msg: 'Restaurant already exists' }] });
            }

            restaurant = new Restaurant({
                name,
                cnpj,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);

            restaurant.password = await bcrypt.hash(password, salt);

            await restaurant.save();

            const payload = {
                user: {
                    id: restaurant.id
                }
            }

            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/restaurant/password
// @desc    change the password validating the old one
// @access  Public
router.put(
    '/password',
    [
        auth,
        [
            check('password', 'Please include a valid password').not().isEmpty(),
            check('newPassword', 'Please enter a new password with 6 or more characters').not().isEmpty().isLength({ min: 6 }),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.user;
        const { password, newPassword } = req.body;

        try {

            let restaurant = await Restaurant.findOne({ _id: id });

            if (!restaurant) {
                return res.status(400).json({ errors: [{ msg: 'Restaurant does not exists' }] });
            }

            const isMatch = await bcrypt.compare(password, restaurant.password);

            if(!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'The old password is incorrect' }] });
            }

            const salt = await bcrypt.genSalt(10);

            restaurant.password = await bcrypt.hash(newPassword, salt);

            await restaurant.save();

            res.send(restaurant);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/restaurant/completeinfo
// @desc    complete the restaurant's information
// @access  Public
router.put(
    '/completeinfo',
    [
        auth,
        [
            check('address', 'Please include a valid address').not().isEmpty(),
            check('zipCode', 'Please include a valid zip code').not().isEmpty().isNumeric(),
            check('number', 'Please include a valid street number').not().isEmpty().isNumeric(),
            check('whatsapp', 'Whatsapp indicator is required').not(),
            check('phone', 'Please include a valid phone').not().isEmpty().isNumeric(),
            check('logo', 'Logo is required').not().isEmpty(),
            check('active', 'Active indicator is required').not(),
            check('distanceLimit', 'Please include a valid distance limit').not().isEmpty().isNumeric(),
            check('paymentWay', 'Please, include valid payment ways').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.user;
        const { address, zipCode, number, whatsapp, phone, logo, active, distanceLimit, paymentWay } = req.body;

        try {

            let restaurant = await Restaurant.findOne({ _id: id });

            if (!restaurant) {
                return res.status(400).json({ errors: [{ msg: 'Restaurant does not exists' }] });
            }

            restaurant.address = address
            restaurant.zipCode = zipCode;
            restaurant.number = number;
            restaurant.whatsapp = whatsapp;
            restaurant.phone = phone;
            restaurant.logo = logo;
            restaurant.active = active;
            restaurant.distanceLimit = distanceLimit;
            restaurant.paymentWay = paymentWay;

            await restaurant.save();

            res.send(restaurant);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   DELETE api/restaurant
// @desc    delete restaurant
// @access  Public
router.delete('/:id', auth,
    async (req, res) => {

        const { id } = req.params;

        try {

            let restaurant = await Restaurant.findOne({ _id: id });

            if (!restaurant) {
                return res.status(400).json({ errors: [{ msg: 'Restaurant does not exists' }] });
            }

            await restaurant.remove({ _id: id });

            const response = {
                msg: "Restaurant successfully deleted",
            }

            res.send(response);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        } 
    }
);


module.exports = router;