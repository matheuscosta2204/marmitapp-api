const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');


const MealOptions = require('../../models/mealOptions');

// @route   GET api/mealOptions/
// @desc    get all mealOptions by restaurant
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const { id } = req.user;
        const mealOptions = await MealOptions.find({ restaurant: id });
        res.send(mealOptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/mealOptions/:id
// @desc    get all mealOptions by unique id
// @access  Public
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const mealOptions = await MealOptions.findOne({ _id: id });
        res.send(mealOptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/menu/
// @desc    register new menu
// @access  Public
router.post(
    '/', 
    [
        auth,
        [
            check('options', 'Please check the options').not(),
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.user;
        const { options } = req.body;

        try {

            let mealOptions = await MealOptions.findOne({ restaurant: id });

            if (mealOptions && mealOptions.options.length >= 5) {
                return res.status(400).json({ errors: [{ msg: 'Maximum 5 options' }] });
            }

            mealOptions = new MealOptions({
                restaurant: id,
                options
            });

            await mealOptions.save();

            res.send(mealOptions);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/menu/
// @desc    update menu
// @access  Public
router.put(
    '/', 
    [
        auth,
        [
            check('_id', 'Id is required').not().isEmpty(),
            check('options', 'Please check the options').not(),
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { _id, options } = req.body;

        try {

            let mealOptions = await MealOptions.findOne({ _id });

            if (!mealOptions) {
                return res.status(400).json({ errors: [{ msg: 'This option does not exists' }] });
            }

            mealOptions.options = options;

            await mealOptions.save();

            res.send(mealOptions);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

module.exports = router;