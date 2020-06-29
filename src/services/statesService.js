exports.getAllStates = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          description: 'Sin asignar',
        },
        {
          id: 2,
          description: 'Asignada',
        },
        {
          id: 3,
          description: 'En ejecucion',
        },
        {
          id: 4,
          description: 'Sin firma',
        },
        {
          id: 5,
          description: 'Cerrada',
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
