const Joi = require('@hapi/joi');

exports.login = (req, res) => {
  try {
    if (req.body.username === 'tapion') {
      throw { message: 'Usuario muy pro' };
    }
    const shema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });
    const value = shema.validate(req.body);
    if (value.error) {
      throw value.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: {
        id: 23,
        user: 'jaime',
        fullNameUser: 'Jaime Rodriguez Perez',
        image:
          'https://s.gravatar.com/avatar/9bc8b5c0d28781f1aee68703937247c1?s=80',
        lastLogin: new Date().setDate(new Date().getDate() - 5),
        roles: [
          {
            id: 1,
            name: 'Operator',
          },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
