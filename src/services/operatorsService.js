const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');

const buildFormForMobile = async (form) => {
  const sectionsResponse = await formModel.getSectionsByForm(form.id);
  return await Promise.all(
    sectionsResponse.rows.map(async (sec) => {
      sec.questions = [];
      sec.name = sec.title;
      const questionsBySection = await formModel.getQuestionsBySection(sec.id);
      questionsBySection.rows.forEach((qu) => {
        qu.type = formModel.types.find((el) => el.id === qu.type * 1).mobile;
      });
      sec.questions.push(questionsBySection.rows);
      return sec;
    })
  );
};

exports.workOrders = async (req, res) => {
  try {
    const schema = Joi.object({
      operatorId: Joi.number().integer().min(1).required(),
    });
    const validate = schema.validate(req.params);
    if (validate.error) {
      throw validate.error;
    }
    const form = await formModel.getForms(5);
    if (form.rowCount === 0) {
      throw new Error(`Forms not found`);
    }

    const formRsp = await Promise.all(
      form.rows.map(async (frm) => {
        frm.sections = await buildFormForMobile(frm);
        return frm;
      })
    );
    res.status(200).json({
      status: 200,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: {
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
            forms: formRsp,
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
            forms: formRsp,
          },
        ],
      },
    });
  } catch (e) {
    res.status(500).json({
      message: 'error',
      body: e.message,
    });
  }
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
