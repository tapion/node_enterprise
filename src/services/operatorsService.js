const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');
const operatorModel = require('../models/operatorModel');
const catalogueModel = require('../models/catalogueModel');

const CTG_CLOSETYPE = 121;

const buildFormForMobile = async (form) => {
  const sectionsResponse = await formModel.getSectionsByForm(form.id);
  return await Promise.all(
    sectionsResponse.rows.map(async (sec) => {
      sec.questions = [];
      sec.name = sec.title;
      const questionsBySection = await formModel.getQuestionsBySection(sec.id);
      questionsBySection.forEach((qu) => {
        qu.type = formModel.types.find((el) => el.id === qu.type * 1).mobile;
      });
      sec.questions.push(questionsBySection);
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
        ot.idSubOt = 1407; //QUEMADO
        ot.idCreateMovil = 0; //QUEMADO
        ot.isMovilCreate = 0; //QUEMADO
        ot.dateStart = 1593981546; //QUEMADO
        ot.dateEnd = 1593981546; //QUEMADO
        ot.detail = ''; //QUEMADO
        //En teoria es catalogo 31 Prioridades?
        ot.isPriority = 33; //QUEMADO
        ot.colour = '#ffff00'; //QUEMADO
        ot.staus = {
          id: ot.stateId,
          description: ot.stateDescription,
        };
        ot.area = {
          id: 10, //QUEMADO
          description: 'MANTENIMIENTO', //QUEMADO
        };
        ot.place = {
          id: 12345, //QUEMADO
          place: ot.placesId,
          email: 'muecas@hotmail.com', //QUEMADO
          emailcc: 'angelosvip@hotmail.com', //QUEMADO
          direction: 'CARRERA 45B # 96-18', //QUEMADO
          latitude: '11.0051809', //QUEMADO
          longitude: '-74.8298796', //QUEMADO
          department: 'CUNDINAMARCA', //QUEMADO
          city: 'BOGOTA', //QUEMADO
          client: {
            id: 111, //QUEMADO
            name: ot.clientId,
          },
        };
        ot.priority = {
          id: 33, //QUEMADO
          priority: 'Alta', //QUEMADO
          alertTimeBefore: '10', //QUEMADO
          colourPriority: '#ffff00', //QUEMADO
        };
        ot.sla = {
          id: 1233, //QUEMADO
          timeMaxSla: '60', //QUEMADO
          alertTimeBeforeSla: '10', //QUEMADO
          colourSla: '#ffff00', //QUEMADO
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
        const form = await formModel.getFormsByOrderType(ot.idTypeOT);
        if (form.rowCount === 0) {
          throw new Error(`Forms not found`);
        }

        const formRsp = await Promise.all(
          form.rows.map(async (frm) => {
            frm.sections = await buildFormForMobile(frm);
            return frm;
          })
        );
        ot.typesClosure = closeTypes;
        ot.forms = formRsp;
        return ot;
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
