const Joi = require("@hapi/joi");

// register validation
const registerValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    user_name: Joi.string()
      .min(4)
      .required()
      .pattern(new RegExp(/^\S+$/))
      .max(15)
      .required()
      .messages({
        "string.pattern.base": `No white space allowed in username`,
        "string.min": "username length must be at least 4 characters long",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .pattern(new RegExp(/^\S+$/))
      .max(15)
      .required()
      .messages({
        "string.pattern.base": `No white space allowed in password`,
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    // console.log(error.details);
    return res.status(400).send({ msg: error.details[0].message });
  }
  next();
};

// login validation
const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    user_name: Joi.string()
      .min(4)
      .required()
      .pattern(new RegExp(/^\S+$/))
      .max(15)
      .required()
      .messages({
        "string.pattern.base": `No white space allowed in username`,
        "string.min": "username length must be at least 4 characters long",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .pattern(new RegExp(/^\S+$/))
      .max(15)
      .required()
      .messages({
        "string.pattern.base": `No white space allowed in password`,
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    // console.log(error.details);
    return res.status(400).send({ msg: error.details[0].message });
  }
  next();
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
