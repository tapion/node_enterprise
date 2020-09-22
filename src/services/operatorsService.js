const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');
const operatorModel = require('../models/operatorModel');
const catalogueModel = require('../models/catalogueModel');

const CTG_CLOSETYPE = 121;

const buildFormForMobile = async (form) => {
  const sectionsResponse = await formModel.getSectionsByForm(form.id);
  return await Promise.all(
    sectionsResponse.rows.map(async (sec) => {
      sec.name = sec.title;
      sec.questions = await formModel.getQuestionsBySection(sec.id);
      sec.questions.forEach((qu) => {
        qu.type = formModel.types.find((el) => el.id === qu.type * 1).mobile;
      });
      return sec;
    })
  );
};

const assignBurnData = (ot) => {
  //ot.idSubOt = 1407; //QUEMADO
  ot.idCreateMovil = 0;
  ot.isMovilCreate = 0;
  ot.dateStart = 1593981546; //QUEMADO
  ot.dateEnd = 1593981546; //QUEMADO
  ot.detail = ''; //QUEMADO
  ot.labelOT = '177/1407';
  //En teoria es catalogo 31 Prioridades?
  ot.isPriority = 33; //QUEMADO
  ot.colour = '#ffff00';
  ot.area = {
    id: 10, //QUEMADO
    description: 'MANTENIMIENTO', //QUEMADO
  };
  ot.priority = {
    id: 33, //QUEMADO
    priority: 'Alta', //QUEMADO
    alertTimeBefore: '10', //QUEMADO
    colourPriority: '#ffff00', //QUEMADO
  };
  ot.sla = {
    id: 1233,
    timeMaxSla: 60,
    alertTimeBeforeSla: 10,
    colourSla: '#ffff00',
  };
  ot.assets = [
    {
      id: 222471, //QUEMADO
      timestamp: '1591136739', //QUEMADO
      code: 'SHJJ0866', //QUEMADO
      name: 'MOTOR XXX', //QUEMADO
      detail: '', //QUEMADO
      img: '', //QUEMADO
      readQR: '0', //QUEMADO
      status: '0', //QUEMADO
    },
  ];
  ot.place.id = 12345; //QUEMADO
  ot.place.email = 'muecas@hotmail.com'; //QUEMADO
  ot.place.emailcc = 'angelosvip@hotmail.com'; //QUEMADO
  ot.place.direction = 'CARRERA 45B # 96-18'; //QUEMADO
  ot.place.latitude = '11.0051809'; //QUEMADO
  ot.place.longitude = '-74.8298796'; //QUEMADO
  ot.place.department = 'CUNDINAMARCA'; //QUEMADO
  ot.place.city = 'BOGOTA'; //QUEMADO
  ot.place.client.id = 111; //QUEMADO
};

const formsByOrderType = async (typeOrder) => {
  const form = await formModel.getFormsByOrderType(typeOrder);
  if (form.rowCount === 0) {
    throw new Error(`Forms not found`);
  }

  return await Promise.all(
    form.rows.map(async (frm) => {
      frm.sections = await buildFormForMobile(frm);
      return frm;
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
    const otsTmp = await operatorModel.getWorkOrderByOperator(
      req.params.operatorId
    );
    const closeTypesRequest = await catalogueModel.getAllChildByParent(
      CTG_CLOSETYPE
    );
    const closeTypes = closeTypesRequest.rows.map((type) => {
      return {
        id: type.id,
        closure: type.name,
        firm: '0',
        division: 'MANTENIMIENTO', //QUEMADO
      };
    });
    const ots = await Promise.all(
      otsTmp.rows.map(async (ot) => {
        ot.staus = {
          id: ot.stateId,
          description: ot.stateDescription,
        };
        ot.place = {
          place: ot.placesId,
          client: {
            name: ot.clientId,
          },
        };
        assignBurnData(ot);
        ot.typesClosure = closeTypes;
        ot.forms = await formsByOrderType(ot.idTypeOT);
        ot.typeOT = {
          id: ot.idTypeOT,
          type: ot.typeOT,
          formsRequired: ot.forms
            .filter((frm) => frm.required)
            .map((frm) => {
              return frm.id;
            }),
        };
        delete ot.idTypeOT;
        return ot;
      })
    );
    res.status(200).json({
      status: 200,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: {
        trackInformation: {
          id: 0, //QUEMADO
          secondSendData: 60, //QUEMADO
          secondSendLocation: 60, //QUEMADO
          startJourney: true, //QUEMADO
          gpsEnabled: true, //QUEMADO
          timeSync: 1538599265, //QUEMADO
          phone: 'string', //QUEMADO
          version: '1.0', //QUEMADO
          userStatus: 0, //QUEMADO
        },
        acl: [
          {
            id: 123,
            acl: 'acl.ots',
            accessLevel: 1,
          },
          {
            id: 234,
            acl: 'acl.mhs',
            accessLevel: 1,
          },
          {
            id: 345,
            acl: 'acl.assets',
            accessLevel: 1,
          },
        ],
        OTs: ots,
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
    status: 200,
    message: 'lbl_resp_succes',
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
