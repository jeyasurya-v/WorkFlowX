const Joi = require('joi');

/**
 * Validate user registration data
 */
exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/**
 * Validate user login data
 */
exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/**
 * Validate organization data
 */
exports.validateOrganization = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Organization name is required'
    }),
    description: Joi.string().allow(''),
    website: Joi.string().uri().allow('').messages({
      'string.uri': 'Website must be a valid URL'
    }),
    logo: Joi.string().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/**
 * Validate pipeline data
 */
exports.validatePipeline = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Pipeline name is required'
    }),
    description: Joi.string().allow(''),
    provider: Joi.string().valid('github', 'gitlab', 'jenkins', 'circleci').required().messages({
      'any.required': 'Provider is required',
      'any.only': 'Provider must be one of: github, gitlab, jenkins, circleci'
    }),
    repositoryUrl: Joi.string().uri().required().messages({
      'string.uri': 'Repository URL must be a valid URL',
      'any.required': 'Repository URL is required'
    }),
    branch: Joi.string().required().messages({
      'any.required': 'Branch is required'
    }),
    organizationId: Joi.string().required().messages({
      'any.required': 'Organization ID is required'
    }),
    credentials: Joi.object().required().messages({
      'any.required': 'Credentials are required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/**
 * Validate notification settings
 */
exports.validateNotificationSettings = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.boolean().default(false),
    slack: Joi.boolean().default(false),
    sms: Joi.boolean().default(false),
    webhooks: Joi.array().items(Joi.string().uri()).default([]),
    events: Joi.object({
      buildSuccess: Joi.boolean().default(true),
      buildFailure: Joi.boolean().default(true),
      buildStarted: Joi.boolean().default(false),
      deploymentSuccess: Joi.boolean().default(true),
      deploymentFailure: Joi.boolean().default(true)
    }).default()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
