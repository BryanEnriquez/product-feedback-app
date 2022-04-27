const Product = require('../models/productModel');
const factory = require('../utils/handlerFactory');

exports.createProduct = factory.createOne(Product, { returning: ['*'] });

exports.getProduct = factory.getOne(Product);

exports.updateProduct = factory.updateOne(Product, ['name']);

exports.deleteProduct = factory.deleteOne(Product);

exports.getAllProducts = factory.getAll(Product, [['suggestions', 'ASC']]);
