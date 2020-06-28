const Joi = require('@hapi/joi');

exports.workOrders = (req, res) => {
  res.status(200).json({
    status: 'success',
    serverTime: Date.now(),
    data: {
      /*timeSendData: '60', 
        timeSendLocation: '60',
        startJourney: '1',
        gpsEnabled: '0',
        timeSync: '1538599265',
        version: '1.0',
        timestampServer: 1591464816, //Viene en el cuerpo de la respuesta es serverTime
        */
      trackInformation: {
        id: 0,
        secondSendData: 60, //timeSendData
        secondSendLocation: 60, //timeSendLocation
        startJourney: true,
        gpsEnabled: true,
        timeSync: 1538599265,
        phone: 'string',
        version: '1.0',
        userStatus: 0,
      },
      acl: [
        {
          id: 123,
          acl: 'acl.ots',
          accessLevel: '1',
        },
        {
          id: 234,
          acl: 'acl.mhs',
          accessLevel: '1',
        },
        {
          id: 345,
          acl: 'acl.assets',
          accessLevel: '1',
        },
      ],
      OTs: [
        {
          id: 123, //Identificador unico
          idSubOT: 1407,
          idCreateMovil: 0,
          isMovilCreate: 0,
          /*idStatus: 1,
            status: 'ASIGNADA',*/
          status: {
            id: 1,
            description: 'ASIGNADA',
          },
          dateStart: '1593981546',
          dateEnd: '1593981546',
          detail: '',
          labelOT: '177/1407',
          idTypeOT: 12,
          typeOT: 'REPARACION',
          isPriority: '0',
          colour: '#ffff00',
          /*idArea: 10,
            area: 'MANTENIMIENTO',*/
          area: {
            id: 10,
            description: 'MANTENIMIENTO',
          },
          place: {
            id: 12345,
            place: 'EDIFICIO SANTA FE',
            email: 'muecas@hotmail.com',
            emailcc: 'angelosvip@hotmail.com',
            direction: 'CARRERA 45B # 96-18',
            latitude: '11.0051809',
            longitude: '-74.8298796',
            department: 'CUNDINAMARCA',
            city: 'BOGOTA',
            /*idClient: 111,
              client: 'LA PISINA',*/
            client: {
              id: 111,
              name: 'LA PISINA',
            },
          },
          priority: {
            id: 123,
            priority: 'MEDIA',
            alertTimeBefore: '10',
            colourPriority: '#ffff00',
          },
          sla: {
            id: 1233,
            timeMaxSla: '60',
            alertTimeBeforeSla: '10',
            colourSla: '#ffff00',
          },
          assets: [
            {
              id: 222471,
              timestamp: '1591136739',
              code: 'SHJJ0866',
              name: 'MOTOR XXX',
              detail: '',
              img: '',
              readQR: '0',
              status: '0',
            },
          ],
          typesClosure: [
            {
              id: '1234',
              closure: 'CUMPLIDA',
              firm: '0',
              division: 'MANTENIMIENTO',
            },
            {
              id: '4312',
              closure: 'CUMPLIDA',
              firm: '0',
              division: 'INSTALACION',
            },
          ],
          forms: [
            {
              id: 123,
              name: "The form's name",
              sections: [
                {
                  name: 'Name of the first section',
                  questions: [
                    {
                      id: 7,
                      text: '7 - Do you have any pets ?',
                      type: 'OptionalQuantityTable',
                      value: null,
                      possibilities: ['cat', 'dog', 'fish'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 0,
                      text: "0 - What's your name ?",
                      type: 'Text',
                      value: null,
                      possibilities: null,
                      condition: null,
                      placeholder: 'Name',
                      invalidMessageKey:
                        'The field is empty, please put your name',
                      isRequired: true,
                    },
                    {
                      id: 1,
                      text: "1 - What's your gender ?",
                      type: 'Radio',
                      value: 'female',
                      possibilities: ['male', 'female'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 2,
                      text: '2 - How old are you ?',
                      type: 'Number',
                      value: null,
                      possibilities: null,
                      condition: {
                        questionId: 1,
                        value: 'male',
                      },
                      placeholder: 'Your age',
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                  ],
                },
                {
                  name: 'Name of the second section',
                  questions: [
                    {
                      id: 3,
                      text: 'Do you have any pets ?',
                      type: 'CheckTable',
                      value: ['cat', 'snake'],
                      possibilities: [
                        'cat',
                        'dog',
                        'snake',
                        'spider',
                        'bird',
                        'fish',
                        'rabbit',
                      ],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 4,
                      text: 'What is the color of your fish ?',
                      type: 'Pick',
                      value: 'blue',
                      possibilities: [
                        'blue',
                        'black',
                        'red',
                        'yellow',
                        'green',
                      ],
                      condition: {
                        questionId: 3,
                        value: 'fish',
                      },
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 5,
                      text: 'Do you like this form ?',
                      type: 'Bool',
                      value: false,
                      possibilities: null,
                      condition: null,
                      isRequired: false,
                    },
                    {
                      id: 6,
                      text: 'Rate this form',
                      type: 'Radio',
                      value: 4,
                      possibilities: [1, 2, 3, 4, 5],
                      condition: null,
                      isRequired: false,
                    },
                    {
                      id: 7,
                      text: 'Do you have any pets ?',
                      type: 'OptionalQuantityTable',
                      value: null,
                      possibilities: ['cat', 'dog', 'fish'],
                      condition: null,
                      invalidMessageKey: 'empty paso por aca',
                      isRequired: false,
                    },
                  ],
                },
                {
                  name: 'Last section',
                  questions: [
                    {
                      id: 7,
                      text: 'Do you have any pets ?',
                      type: 'OptionalQuantityTable',
                      value: null,
                      possibilities: ['cat', 'dog', 'fish'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 126,
          idSubOT: 517,
          idCreateMovil: 0,
          isMovilCreate: 0,
          /*idStatus: 1,
            status: 'ASIGNADA',*/
          status: {
            id: 1,
            description: 'ASIGNADA',
          },
          dateStart: '1594067946',
          dateEnd: '1594067946',
          detail: '',
          labelOT: '924/517',
          idTypeOT: 12,
          typeOT: 'REPARACION',
          isPriority: '0',
          colour: '#ffff00',
          /*idArea: 10,
            area: 'MANTENIMIENTO',*/
          area: {
            id: 10,
            description: 'MANTENIMIENTO',
          },
          place: {
            id: 123457,
            place: 'EDIFICIO SANTA FE 2',
            email: 'muecas@gmail.com',
            emailcc: 'angelosvip@gmail.com',
            direction: 'CARRERA 45B # 96-18 SANTA FE',
            latitude: '11.0051809',
            longitude: '-74.8298796',
            department: 'CUNDINAMARCA',
            city: 'BOGOTA',
            /*idClient: 111,
              client: 'LA PISINA',*/
            client: {
              id: 111,
              name: 'LA PISINA',
            },
          },
          priority: {
            id: 124,
            priority: 'ALTA',
            alertTimeBefore: '10',
            colourPriority: '#ff0d00',
          },
          sla: {
            id: 1233,
            timeMaxSla: '60',
            alertTimeBeforeSla: '10',
            colourSla: '#ff0d00',
          },
          assets: [
            {
              id: 222472,
              timestamp: '1591136730',
              code: 'SHJJ924',
              name: 'MOTOR XXX2',
              detail: '',
              img: '',
              readQR: '1',
              status: '0',
            },
          ],
          typesClosure: [
            {
              id: '1234',
              closure: 'CUMPLIDA',
              firm: '1',
              division: 'MANTENIMIENTO',
            },
            {
              id: '4312',
              closure: 'CUMPLIDA',
              firm: '0',
              division: 'INSTALACION',
            },
          ],
          forms: [
            {
              id: 122,
              name: "The form's name",
              sections: [
                {
                  name: 'Name of the first section',
                  questions: [
                    {
                      id: 7,
                      text: '7 - Do you have any pets ?',
                      type: 'OptionalQuantityTable',
                      value: null,
                      possibilities: ['cat', 'dog', 'fish'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 0,
                      text: "0 - What's your name ?",
                      type: 'Text',
                      value: null,
                      possibilities: null,
                      condition: null,
                      placeholder: 'Name',
                      invalidMessageKey:
                        'The field is empty, please put your name',
                      isRequired: true,
                    },
                    {
                      id: 1,
                      text: "1 - What's your gender ?",
                      type: 'Radio',
                      value: 'female',
                      possibilities: ['male', 'female'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                    {
                      id: 2,
                      text: '2 - How old are you ?',
                      type: 'Number',
                      value: null,
                      possibilities: null,
                      condition: {
                        questionId: 1,
                        value: 'male',
                      },
                      placeholder: 'Your age',
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                  ],
                },
                {
                  name: 'Last section',
                  questions: [
                    {
                      id: 7,
                      text: 'Do you have any pets ?',
                      type: 'OptionalQuantityTable',
                      value: null,
                      possibilities: ['cat', 'dog', 'fish'],
                      condition: null,
                      invalidMessageKey: 'empty',
                      isRequired: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });
};

exports.getAllOperators = (req, res) => {
  res.status(200).json({
    status: 'success',
    serverTime: Date.now(),
    data: [
      {
        id: 35,
        name: 'Mauricio',
      },
      {
        id: 12,
        name: 'Patron',
      },
      {
        id: 11,
        name: 'Jerson',
      },
      {
        id: 56,
        name: 'Juan',
      },
      {
        id: 7,
        name: 'Miguel',
      },
    ],
  });
};

exports.getLocations = (req, res) => {
  try {
    const shema = Joi.object({
      idCompany: Joi.number().integer().required(),
    });
    const value = shema.validate(req.query);
    if (!value.error) {
      res.status(200).json({
        status: 'success',
        serverTime: Date.now(),
        data: [
          {
            id: 1,
            title: 'Parqueadero Antioquia',
            latitude: 4.613417,
            longitude: -74.075489,
          },
          {
            id: 2,
            title: 'Sede Mexico',
            latitude: 4.615266,
            longitude: -74.136272,
          },
          {
            id: 5,
            title: 'Parqueadero Antioquia',
            latitude: 4.613417,
            longitude: -74.075489,
          },
          {
            id: 12,
            title: 'Risaralda taller',
            latitude: 4.614951,
            longitude: -74.135976,
          },
          {
            id: 14,
            title: 'Tuberias Joy',
            latitude: 4.612317,
            longitude: -74.074748,
          },
        ],
      });
    } else {
      throw value.error;
    }
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
