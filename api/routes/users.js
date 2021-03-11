const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../model/user');


router.get('/', (req, res, next) => {
    User.find()
        .exec()
        .then(users => {
            res.status(200).json(users)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
})

router.post('/signup', (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(422).json({
                    message: 'User already exists'
                })
            } else {
                bcrypt.hash(req.body.email, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: req.body.password
                        });

                        user
                            .save()
                            .then(result => {
                                console.log(result)
                                res.status(200).json({
                                    message: "User created"
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }
                })
            }
        })
});


router.delete('/:userId', (req, res, next) => {
    User.remove({
            _id: req.params.userId
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;