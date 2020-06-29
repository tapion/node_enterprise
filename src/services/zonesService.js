exports.getAllZones = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          description: 'Sur Occidente',
        },
        {
          id: 2,
          description: 'Nor Occidente',
        },
        {
          id: 3,
          description: 'Sur oriente',
        },
        {
          id: 4,
          description: 'Nor Oriente',
        },
        {
          id: 5,
          description: 'Sur',
        },
        {
          id: 6,
          description: 'Norte',
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
