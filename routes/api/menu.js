const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');


const Menu = require('../../models/menu');

// @route   GET api/menu/
// @desc    get days menus
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const menus = await Menu.find({ date: moment().format('YYYY-MM-DD') });
        res.send(menus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/menu/restaurant/:id
// @desc    get menus by restaurant
// @access  Public
router.get('/restaurant/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const menus = await Menu.find({ restaurant: id });
        res.send(menus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/menu/:id
// @desc    get menu by id
// @access  Public
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await Menu.findOne({ _id: id });
        res.send(menu);
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
            check('restaurant', 'Restaurant is required').not().isEmpty(),
            check('date', 'Date is required').not().isEmpty(), //YYYY-MM-DD
            check('mainDishes', 'Please check the main dishes').not().isArray().custom(array => array.lenght <= 3),
            check('sideDishes', 'Please check the side dishes').not().isArray().custom(array => array.lenght <= 5),
            check('salads', 'Please check the salads').not().isArray().custom(array => array.lenght <= 3),
            check('desserts', 'Please check the desserts').not().isArray().custom(array => array.lenght <= 3),
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { restaurant, date, mainDishes, sideDishes, salads, desserts } = req.body;

        try {

            let menu = await Menu.findOne({ date });

            if (menu) {
                return res.status(400).json({ erros: [{ msg: 'Already exists menu to this date' }] });
            }

            menu = new Menu({
                restaurant,
                date,
                mainDishes,
                sideDishes,
                salads,
                desserts
            });

            await menu.save();

            res.send(menu);

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
            check('id', 'Id is required').not().isEmpty(),
            check('date', 'Date is required').not().isEmpty(), //YYYY-MM-DD
            check('mainDishes', 'Please check the main dishes').not().isArray().custom(array => array.lenght <= 3),
            check('sideDishes', 'Please check the side dishes').not().isArray().custom(array => array.lenght <= 5),
            check('salads', 'Please check the salads').not().isArray().custom(array => array.lenght <= 3),
            check('desserts', 'Please check the desserts').not().isArray().custom(array => array.lenght <= 3),
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, date, mainDishes, sideDishes, salads, desserts } = req.body;

        try {

            let menu = await Menu.findOne({ _id: id });

            if (!menu) {
                return res.status(400).json({ erros: [{ msg: 'Menu does not exists' }] });
            }

            menu.date = date;
            menu.mainDishes = mainDishes;
            menu.sideDishes = sideDishes;
            menu.salads = salads;
            menu.desserts = desserts;

            await menu.save();

            res.send(menu);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

// @route   DELETE api/menu
// @desc    delete menu
// @access  Public
router.delete('/:id', auth,
    async (req, res) => {

        const { id } = req.params;

        try {

            let menu = await Menu.findOne({ _id: id });

            if (!menu) {
                return res.status(400).json({ erros: [{ msg: 'Menu does not exists' }] });
            }

            await restaurant.remove({ _id: id });

            const response = {
                msg: "Menu successfully deleted",
            }

            res.send(response);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        } 
    }
);

module.exports = router;