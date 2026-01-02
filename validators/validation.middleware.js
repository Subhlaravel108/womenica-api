export const validateSchema = (schema) => {
  return async (request, reply) => {
    try {
      request.body = await schema.validate(request.body, {
        abortEarly: false,
        stripUnknown: true
      });
    } catch (error) {
      const errors = {};

      error.inner.forEach(err => {
        if (!errors[err.path]) {
          errors[err.path] = err.message;
        }
      });

      return reply.code(400).send({
        success: false,
        message: 'Validation Failed',
        errors
      });
    }
  };
};
