const Joi = require('@hapi/joi');
const dotenv = require('dotenv');
const formModel = require('../models/formModel');
const operatorModel = require('../models/operatorModel');
const catalogueModel = require('../models/catalogueModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');


dotenv.config({ path: './config.env' });

const findAnswer = (questionId,response) => {
  if(!response || response.rowCount <= 0) return null;
  const data = JSON.parse(response.rows[0].data);
  const questions = data.sections.map(sec => {
    return sec.questions.filter(que => que.id === questionId);
  });
  const sectionWithQuestion = questions.filter(sec => {
    const question = sec.filter(que => que.id === questionId);
    return question.length > 0;
  });
  if(sectionWithQuestion.length > 0){
    const question = sectionWithQuestion[0][0];
    let answer = null;
    switch(question.type){
      case 'Radio':
      case 'CheckTable':
      case 'Pick':
      case 'ComboBox':
        answer = question.possibilities.filter(opc => opc.check === true);
        answer =  (answer.length > 0 && answer[0].value) ? answer[0].value : null;
        break;
      case 'Number':
      case 'DateW':
      case 'HourW':
      case 'Text':
      case 'TextArea':
        answer = question.value;
        break;
      case 'IMAGEN':
        answer = null;
        break;
      default:
        answer = `No response valid for type ${question.type}`;
        break;
    }
    return answer;
  }
  return null;
}

const buildFormForMobile = async (form,taskForWeb,token) => {
  const sectionsResponse = await formModel.getSectionsByForm(form.id);
  const responseFromWeb = (taskForWeb) ? await formModel.responseTaskAsignedByweb(taskForWeb,form.id) : null;
  return Promise.all(
    sectionsResponse.rows.map(async (sec) => {
      sec.name = sec.title;
      sec.questions = await formModel.getQuestionsBySection(sec.id,token);
      sec.questions.forEach((qu) => {
        qu.type = formModel.types.find((el) => el.id === qu.type * 1).mobile;
        qu.condition.forEach((q) => {
          q.questionId = q.source;
          q.value = q.sourceValue;
          delete q.source;
          delete q.sourceValue;
        });
        qu.value = findAnswer(qu.id,responseFromWeb);
      });
      return sec;
    })
  );
};

const assignBurnData = (ot) => {
  //ot.idSubOt = 1407; //QUEMADO
  ot.idCreateMovil = 0;
  ot.isMovilCreate = 0;
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

const formsByTaskId = async (typeOrder,taskForWeb,token) => {
  const form = await formModel.getFormsByTaskId(typeOrder);
  return Promise.all(
    form.rows.map(async (frm) => {
      frm.sections = await buildFormForMobile(frm,taskForWeb,token);
      return frm;
    })
  );
};


exports.getTasksByUser = wrapAsyncFn(async (req, res) => {
  const operator = await operatorModel.getTasksByUser(req.userLoged.userName);
  if(operator.rows.length <= 0)
        throw new AppError(
            `Not found tasks for user: ${req.userLoged.userName}`,
            200
  );
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: operator.rows,
  });
});

const asignOtValues = async (otsTmp,closeTypes,token) => {
  return Promise.all(
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
      const taskIdWeb = ot.isWeb ? ot.taskId : null;
      ot.forms = await formsByTaskId(ot.orderTypeTaskId,taskIdWeb,token);
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
      delete ot.trackingPerMinute;
      delete ot.syncNetwork;
      delete ot.syncWifi;
      delete ot.uploadFilesCamera;
      delete ot.uploadFilesGallery;
      return ot;
    })
  );  
}


exports.workOrders = wrapAsyncFn(async (req, res) => {
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
    const trakingInfo = otsTmp.rowCount > 0 ? otsTmp.rows[0] : {trackingPerMinute: 0};
    const secondSendData = ((trakingInfo.trackingPerMinute * 1) > 0) ? trakingInfo.trackingPerMinute * 60 : 0;
    const gpsEnabled = trakingInfo.trackingPerMinute > 0 ? true : false;
    const hasSyncNetwork = trakingInfo.syncNetwork || false;
    const hasSyncWifi = trakingInfo.syncWifi || false;
    const allowUploadFilesCamera = trakingInfo.uploadFilesCamera || false;
    const allowUploadFilesGallery = trakingInfo.uploadFilesGallery || false;
    const ots = await asignOtValues(otsTmp,closeTypes,req.get('Authorization'));
    res.status(200).json({
      status: 200,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: {
        trackInformation: {
          id: 0, //QUEMADO
          secondSendData,
          secondSendLocation: secondSendData,
          hasSyncNetwork,
          hasSyncWifi,
          allowUploadFilesCamera,
          allowUploadFilesGallery,
          gpsEnabled,
          startJourney: true, //QUEMADO
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
});

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
