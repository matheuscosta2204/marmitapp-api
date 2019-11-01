const mysql = require('../config/mysql');

const db = new mysql();

exports.getAllUsers = (func) => {
    return db.query('SELECT * FROM user', func);
}

exports.getUserByEmail = async (email) => {
    return db.query('SELECT * FROM user').then(rows => {
        return rows[0];
    });
}