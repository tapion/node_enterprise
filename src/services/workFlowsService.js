const Joi = require('@hapi/joi');

exports.getWorkFlows = (req, res) => {
  try {
    const schema = Joi.object({
      dateType: Joi.number().integer().min(0).required(),
      startDate: Joi.date().max(Joi.ref('endDate')).required(),
      endDate: Joi.date().required(),
      idClient: Joi.number().integer().min(0).empty(''),
      idOperator: Joi.number().integer().min(0).empty(''),
      idDivision: Joi.number().integer().min(0).empty(''),
      idState: Joi.number().integer().min(0).empty(''),
    });
    const validate = schema.validate(req.query);
    if (validate.error) {
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Actividad 1',
          date: new Date().setDate(new Date().getMinutes() - 30),
          client: {
            id: 2,
            name: 'Pepsi',
          },
          operator: {
            id: 12,
            name: 'Patron',
          },
          zone: {
            id: 3,
            name: 'Sur Oriente',
          },
          state: {
            id: 1,
            name: 'Sin asignar',
          },
        },
        {
          id: 2,
          name: 'Actividad 2',
          date: new Date().setDate(new Date().getMinutes() - 60),
          client: {
            id: 1,
            name: 'Cumis',
          },
          operator: {
            id: 11,
            name: 'Jerson',
          },
          zone: {
            id: 5,
            name: 'Sur',
          },
          state: {
            id: 4,
            name: 'Sin firma',
          },
        },
        {
          id: 3,
          name: 'Actividad 3',
          date: new Date().setDate(new Date().getMinutes() - 120),
          client: {
            id: 3,
            name: 'Vanti',
          },
          operator: {
            id: 56,
            name: 'Juan',
          },
          zone: {
            id: 6,
            name: 'Norte',
          },
          state: {
            id: 5,
            name: 'Cerrada',
          },
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

exports.getFormsBysWorkOrder = (req, res) => {
  const test = {
    id: 123123,
    form_id: 2212,
    id_task: 517924,
    form: {
      id: 19,
      name: 'Información del propietario',
      description: 'Información del propietario',
      state: true,
      user_creation: '1',
      required: true,
      sections: [
        {
          id: 30,
          title: 'Sección',
          state: false,
          name: 'Sección',
          questions: [
            {
              id: 40,
              text: 'Nombre propietario',
              description: 'Agregar un campo de texto',
              type: 'Text',
              icon: 'fa-edit',
              isrequired: true,
              section_id: 30,
              source_idtable: null,
              source_namesource: null,
              possibilities: [],
              condition: [],
              placeholder: null,
              readonly: false,
              value: null,
            },
            {
              id: 41,
              text: 'Genero',
              description: 'Agregar una lista de opciones con selección unica',
              type: 'Radio',
              icon: 'fa-check-circle',
              isrequired: false,
              section_id: 30,
              source_idtable: '184',
              source_namesource: null,
              possibilities: [
                { id: 181, name: 'Masculino', value: 'M', state: true },
                { id: 182, name: 'Femenino', value: 'F', state: true },
                { id: 183, name: 'Otro', value: 'O', state: true },
              ],
              condition: [],
              placeholder: null,
              readonly: false,
              value: null,
            },
            {
              id: 42,
              text: 'Tipo de licencia',
              description:
                'Agregar una lista de opciones con selección multiple',
              type: 'CheckTable',
              icon: 'fa-check-square',
              isrequired: false,
              section_id: 30,
              source_idtable: '191',
              source_namesource: 'Tipos de licencia',
              possibilities: [
                { id: 192, name: 'Licencia C2', value: 'C2', state: true },
                { id: 193, name: 'Licencia C1', value: 'C1', state: true },
              ],
              condition: [],
              placeholder: null,
              readonly: false,
              value: null,
            },
          ],
        },
      ],
    },
    account_id: 924,
    user_device: '517',
    time_save: 1601255422368,
    latitude: 11.0051809,
    longitude: -74.8298796,
    forwardings: 0,
    send: 0,
    eraser: 0,
  };
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: test.form,
  });
};
