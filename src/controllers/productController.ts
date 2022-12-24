import Product from '../models/productModel';
import * as factory from '../utils/handlerFactory';

export const createProduct = factory.createOne(Product, {
  fields: ['name'],
});

export const getProduct = factory.getOne(Product);

export const updateProduct = factory.updateOne(Product, {
  fields: ['name'],
});

export const deleteProduct = factory.deleteOne(Product);

export const getAllProducts = factory.getAll(Product, [['suggestions', 'ASC']]);
