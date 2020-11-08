const Joi = require('@hapi/joi');
const dotenv = require('dotenv');
const formModel = require('../models/formModel');
const operatorModel = require('../models/operatorModel');
const catalogueModel = require('../models/catalogueModel');

dotenv.config({ path: './config.env' });

const buildFormForMobile = async (form) => {
  const sectionsResponse = await formModel.getSectionsByForm(form.id);
  return await Promise.all(
    sectionsResponse.rows.map(async (sec) => {
      sec.name = sec.title;
      sec.questions = await formModel.getQuestionsBySection(sec.id);
      sec.questions.forEach((qu) => {
        qu.type = formModel.types.find((el) => el.id === qu.type * 1).mobile;
        qu.condition.forEach((q) => {
          q.questionId = q.source;
          q.value = q.sourceValue;
          delete q.source;
          delete q.sourceValue;
        });
      });
      return sec;
    })
  );
};

const assignBurnData = (ot) => {
  //ot.idSubOt = 1407; //QUEMADO
  ot.idCreateMovil = 0;
  ot.isMovilCreate = 0;
  ot.dateStart = parseInt(Date.now() / 1000, 10); //QUEMADO
  ot.dateEnd = parseInt(Date.now() / 1000, 10); //QUEMADO
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

const formsByTaskId = async (typeOrder) => {
  const form = await formModel.getFormsByTaskId(typeOrder);
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
      process.env.CTG_TASKID
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
        ot.forms = await formsByTaskId(ot.taskId);
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
        id: 12,
        name: 'Inspector 1',
      },
      {
        id: 12,
        name: 'Inspector 2',
      },
      {
        id: 12,
        name: 'Inspector 3',
      },
      {
        id: 12,
        name: 'Inspector 4',
      },
      {
        id: 12,
        name: 'Inspector 5',
      },
    ],
  });
};
