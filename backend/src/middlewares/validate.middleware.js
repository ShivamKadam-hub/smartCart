function validateMiddleware(schema) {
  return (req, res, next) => {
    const sections = ['body', 'params', 'query'];
    const validated = {};

    for (const section of sections) {
      if (!schema[section]) {
        continue;
      }

      const result = schema[section].validate(req[section], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (result.error) {
        return res.status(400).json({
          message: 'Validation failed.',
          details: result.error.details.map((item) => item.message),
        });
      }

      validated[section] = result.value;
    }

    Object.assign(req, validated);
    return next();
  };
}

module.exports = validateMiddleware;
