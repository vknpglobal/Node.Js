const Product = require('../model/product');
const mongoose = require('mongoose');

exports.get_all_products = (req, res, next) => {
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
}

exports.create_product = (req, res, next) => {
    // console.log(req.file)
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

}