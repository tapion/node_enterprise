exports.getAllStates = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Sin asignar',
        },
        {
          id: 2,
          name: 'Asignada',
        },
        {
          id: 3,
          name: 'En ejecucion',
        },
        {
          id: 4,
          name: 'Sin firma',
        },
        {
          id: 5,
          name: 'Cerrada',
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
