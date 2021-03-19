const express = require('express');
const router = express.Router();

const Product = require('../model/product');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});

router.get('/', (req, res, next) => {
	console.log(req, res)
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            // if(docs.length > 0) {
            res.status(200).json(response);
            // } else {
            //     res.status(404).json({
            //         message: 'No entry found'
            //     })
            // }
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        });

});

router.post('/', upload.single('productImage'),(req, res, next) => {
    console.log(req.file)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
       // productImage: req.file.path
    });
    product.save()
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
        }).catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            })
        });

});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No valid entry found'
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        });
})


router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.updateOne({
            _id: id
        }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        });
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({
            _id: id
        })
        .exec()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        });
})


module.exports = router;