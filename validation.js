const Joi = require("@hapi/joi");

// register validation
const registerValidation = (req, res, next) => {
  const schema = {
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send({ msg: error.details[0].message });
  next();
};

// login validation
const loginValidation = (req, res, next) => {
  const schema = {
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send({ msg: error.details[0].message });
  next();
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
