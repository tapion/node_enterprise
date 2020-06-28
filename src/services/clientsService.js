exports.getClients = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Cumis',
        },
        {
          id: 2,
          name: 'Pepsi',
        },
        {
          id: 3,
          name: 'Vanti',
        },
        {
          id: 5,
          name: 'Enel',
        },
        {
          id: 4,
          name: 'ETB',
        },
      ],
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
