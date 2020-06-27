const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    saludo: 'hola Miguel',
  });
});

app.listen(3000, () => {
  console.log('Inicio esto');
});
