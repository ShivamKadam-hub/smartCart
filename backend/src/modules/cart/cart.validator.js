const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const addItemBody = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).max(999).default(1),
});

const updateItemBody = Joi.object({
  quantity: Joi.number().integer().min(1).max(999).required(),
});

const itemIdParam = Joi.object({
  itemId: objectId.required(),
});

const savedItemIdParam = Joi.object({
  savedItemId: objectId.required(),
});

module.exports = {
  addItemBody,
  updateItemBody,
  itemIdParam,
  savedItemIdParam,
};
