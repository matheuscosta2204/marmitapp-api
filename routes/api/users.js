const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @route   GET api/users/
// @desc    Get all users
// @access  Public
router.get('/', auth, async (req, res) => {
    try {        
        const users = await User.find();
        res.send(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/
// @desc    Register route
// @access  Public
router.post(
    '/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {

            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ erros: [{ msg: 'User already exists' }] });
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });


            user = new User({
                name,
                email,
                avatar,
                password
            })

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

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
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/users/favorites
// @desc    update users' favorites restaurants
// @access  Public
router.put(
    '/', 
    [
        auth,
        [
            check('id', 'Id is required').not().isEmpty(),
            check('favorites', 'Please check favorites list').not().isEmpty()
        ]
    ], 
    async (req, res) => {      
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, favorites } = req.body;

        try {

            const user = await User.findOne({ _id: id });

            user.favorites = favorites;

            await user.save();

            res.send(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});

module.exports = router;