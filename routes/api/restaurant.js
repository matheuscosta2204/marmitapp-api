const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const { checkCNPJ } = require('../../helper/util');

const Restaurant = require('../../models/restaurant');

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
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findOne({ _id: id });
        res.send(restaurant);
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
        auth,
        [
            check('name', 'Name is required').not().isEmpty(),
            check('cnpj', 'Please include a valid CNPJ').not().isEmpty().custom(value => checkCNPJ(value)),
            check('email', 'Please include a valid email').isEmail(),
            check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
        ]
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
                return res.status(400).json({ erros: [{ msg: 'Restaurant already exists' }] });
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
                restaurant: {
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

// @route   PUT api/restaurant/completeinfo
// @desc    complete the restaurant's information
// @access  Public
router.put(
    '/completeinfo',
    [
        auth,
        [
            check('id', 'Id is required').not().isEmpty(),
            check('zipCode', 'Please include a valid zip code').not().isEmpty().isNumeric(),
            check('number', 'Please include a valid street number').not().isEmpty().isNumeric(),
            check('phone', 'Please include a valid phone').not().isEmpty().isNumeric(),
            check('logo', 'Logo is required').not(),
            check('active', 'Active indicator is required').not()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, zipCode, number, phone, logo, active } = req.body;

        try {

            let restaurant = await Restaurant.findOne({ _id: id });

            if (!restaurant) {
                return res.status(400).json({ erros: [{ msg: 'Restaurant does not exists' }] });
            }

            restaurant.zipCode = zipCode;
            restaurant.number = number;
            restaurant.phone = phone;
            restaurant.logo = logo;
            restaurant.active = active;

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
                return res.status(400).json({ erros: [{ msg: 'Restaurant does not exists' }] });
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