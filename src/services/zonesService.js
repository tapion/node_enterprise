exports.getAllZones = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Sur Occidente',
        },
        {
          id: 2,
          name: 'Nor Occidente',
        },
        {
          id: 3,
          name: 'Sur oriente',
        },
        {
          id: 4,
          name: 'Nor Oriente',
        },
        {
          id: 5,
          name: 'Sur',
        },
        {
          id: 6,
          name: 'Norte',
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
