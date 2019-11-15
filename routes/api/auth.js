const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Restaurant = require('../../models/restaurant');

// @route   GET api/auth/
// @desc    Test route
// @access  Public
router.get('/', auth, (req, res) => res.send('Auth route'));

// @route   POST api/auth/users
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/users', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if(!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id
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
            console.error(err);
            return res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/auth/restaurants
// @desc    Authenticate restaurants & get token
// @access  Public
router.get('/restaurants', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.user.id).select('-password');
        res.json(restaurant);
    } catch (err) {
        res.status(500).send('Server Error');
    }
})

// @route   POST api/auth/restaurants
// @desc    Authenticate restaurants & get token
// @access  Public
router.post(
    '/restaurants', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { email, password } = req.body;

        try {
            let restaurant = await Restaurant.findOne({ email });

            if(!restaurant) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, restaurant.password);

            if(!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

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
            console.error(err);
            return res.status(500).send('Server Error');
        }
    }
);

module.exports = router;