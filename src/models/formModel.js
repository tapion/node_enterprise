const bent = require('bent');
const dotenv = require('dotenv');
const db = require('../db');

let previusRequest;

dotenv.config({ path: './config.env' });

exports.types = [
  { id: 0, front: 'LABEL', mobile: 'Label' },
  { id: 1, front: 'TEXT', mobile: 'Text' },
  { id: 2, front: 'RADIOGROUP', mobile: 'Radio' },
  { id: 3, front: 'CHECKGROUP', mobile: 'CheckTable' },
  { id: 4, front: 'TEXTAREA', mobile: 'Text' },
  { id: 5, front: 'COMBOBOX', mobile: 'Pick' },
  { id: 6, front: 'SECTION', mobile: '' },
  { id: 7, front: 'NUMBER', mobile: 'Number' },
  { id: 8, front: 'IMAGE', mobile: 'Photo' },
  { id: 9, front: 'DATE', mobile: 'DateW' },
  { id: 10, front: 'TIME', mobile: 'HourW' },
];

const createJsonFromArray = (arr) => {
  try {
    if (arr.length > 0) {
      if (arr.length === 1) {
        return JSON.stringify(arr[0]);
      }
      return arr.reduce((acc, val, idx) => {
        if (idx === 1) {
          return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
        }
        return `${acc},${JSON.stringify(val)}`;
      });
    }
    return '';
  } catch (e) {
    throw new Error(e);
  }
};

const consumeCatalogs = async (catalog, caller) => {
  previusRequest = catalog;
  const response = await caller('/v1/catalog/', {
    name: catalog.name,
    status: catalog.status,
    userName: catalog.userName,
    description: catalog.name,
    abbreviation: catalog.value,
    catalog_id: catalog.father,
  });
  return response.data;
};

const createCatalogs = async (quest, user) => {
  try {
    const post = bent(`${process.env.CATALOG_HOST}`, 'POST', 'json', 200);

    return await Promise.all(
      quest.map(async (q) => {
        if (q.nameSource) {
          q.source.forEach((ctg) => {
            if (!ctg.abbreviation || !ctg.name)
              throw new Error(
                `Error creating new a catalog: ${q.nameSource} has child without value or name, the data is, Name: ${ctg.name} and Abbreviation: ${ctg.abbreviation}`
              );
          });
          q.idTable = await consumeCatalogs(
            {
              name: q.nameSource,
              status: true,
              userName: user.userName,
              value: q.nameSource,
              father: 0,
            },
            post
          );
          q.source = await Promise.all(
            q.source.map(async (q1) => {
              q1.id = await consumeCatalogs(
                {
                  name: q1.name,
                  status: true,
                  userName: user.userName,
                  value: q1.abbreviation,
                  father: q.idTable,
                },
                post
              );
              return q1;
            })
          );
        }
        return q;
      })
    );
  } catch (e) {
    if (e.statusCode) {
      const obj = await e.json();
      obj.message = `${obj.message}, with catalog ${JSON.stringify(
        previusRequest
      )} `;
      throw obj;
    }
    throw e;
  }
};

const saveForm = async (
  client,
  quest,
  body,
  sec,
  user,
  parentFormId = null
) => {
  const form = {};
  let res = await client.query(
    'INSERT INTO forms ("name", description, state, user_creation,"formIdParent") VALUES ($1,$2,$3,$4,$5) RETURNING id;',
    [body.name, body.description, body.state, user.userName, parentFormId]
  );
  form.id = res.rows[0].id;
  //Sections
  const newSections = await Promise.all(
    sec.map(async (section) => {
      res = await client.query(
        'INSERT INTO sections ("name", state, form_id, user_creation) VALUES ($1,$2, $3, $4) RETURNING id;',
        [section.title, section.isRequired, form.id, user.userName]
      );
      section.idk = res.rows[0].id;
      return section;
    })
  );
  //Questions
  const newQuestions = await Promise.all(
    quest.map(async (question) => {
      if (!question.idSection)
        throw new Error(
          `All elements must have a sections, no section on element id ${question.id}`
        );
      const values = createJsonFromArray(question.source);
      const sectionId = newSections.find((el) => el.id == question.idSection);
      if (!sectionId) {
        throw new Error(
          `There isn't an element with id: ${question.idSection} and this is asociated with like a section`
        );
      }
      res = await client.query(
        `INSERT INTO questions(
          title
          ,description
          ,"type"
          , icon
          , isrequired
          , source_idtable
          , source_namesource
          , source_values
          , section_id
          , user_creation
          , placeholder
          , readonly
          , defaultvalue
            )
      VALUES($1,$2, $3, $4, $5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id;`,
        [
          question.title,
          question.description,
          question.type,
          question.icon,
          question.isRequired,
          question.idTable,
          question.nameSource,
          `[${values}]`,
          sectionId.idk,
          user.userName,
          question.placeHolder,
          question.isReadOnly,
          question.value,
        ]
      );
      question.idk = res.rows[0].id;
      question.section_idk = sectionId.idk;
      return question;
    })
  );
  //Conditions
  await Promise.all(
    newQuestions.map(async (el, ind, arr) => {
      el.conditions.forEach((con) => {
        con.source = arr.find((qu) => qu.id == con.source).idk;
        con.target = arr.find((qu) => qu.id == con.target).idk;
      });
      res = await client.query(
        'UPDATE questions set conditions = $2 where id = $1',
        [el.idk, `[${createJsonFromArray(el.conditions)}]`]
      );
    })
  );
  body.id = form.id;
  return form.id;
};

exports.CreateForm = async (body, sec, quest, user) => {
  quest = await createCatalogs(quest, user);
  return await db.transactions(async (client) => {
    await saveForm(client, quest, body, sec, user);
    return { body, sec, quest };
  });
};

exports.updateForm = async (body, sec, quest, parentFormId, user) => {
  quest = await createCatalogs(quest, user);
  return db.transactions(async (client) => {
    await client.query(
      'UPDATE forms set deleted = true,user_modification = $2, modification=now() where id = $1',
      [parentFormId, user.userName]
    );
    const formId = await saveForm(client, quest, body, sec, user, parentFormId);
    await client.query(
      `INSERT INTO "formsTypeTasks" ("taskId", "formId" ,required, "creationUser" )
      SELECT "taskId", $1, required, $2 FROM "formsTypeTasks" WHERE "formId" = $3 `,
      [formId, user.userName, parentFormId]
    );
    await client.query(
      `UPDATE "formsTypeTasks" set state = false, "modificationUser"=$2, "modificationDate"=now() WHERE "formId" = $1 `,
      [parentFormId, user.userName]
    );
    return { body, sec, quest };
  });
};

exports.getFormById = async (formId) => {
  return db.query(
    'SELECT id, "name", description, state, user_creation FROM forms WHERE id = $1 AND deleted = FALSE',
    [formId]
  );
};

exports.getFormsByTaskId = async (taskId) => {
  return db.query(
    `select f2.id,
          f2."name",
          f2.description,
          f2.state,
          f2.user_creation
          ,ftt.required 
      from "orderTypeTask" ott  
      inner join "formsTypeTasks" ftt on ftt."taskId" = ott."taskId" 
      inner JOIN forms f2 ON f2.id = ftt."formId" AND f2.state = TRUE  AND f2.deleted = false
      where ott.id = $1
      ORDER BY f2."name"`,
    [taskId]
  );
};

exports.getAllForms = async () => {
  return await db.query(
    `SELECT id
    , "name"
    , description
    , state
    FROM forms 
    WHERE deleted = FALSE ORDER BY id DESC`
  );
};

exports.getSectionsByForm = async (formId) => {
  return await db.query(
    'SELECT id, "name" as title, state FROM sections WHERE form_id = $1 AND deleted = FALSE ORDER BY id',
    [formId]
  );
};

const buildSourceFromCatalog = async (idTable) => {
  try {
    const caller = bent(`${process.env.CATALOG_HOST}`, 'GET', 'json', 200);
    if (idTable) {
      const response = await caller(`/v1/options/${idTable}`);
      return response.data.map((res) => {
        return {
          id: res.id,
          name: res.name,
          value: res.abbreviation,
          state: res.status,
        };
      });
    }
    return [];
  } catch (e) {
    console.log('Error consumiendo servicio de catalogos', e);
    throw e;
  }
};

exports.getQuestionsByForm = async (formId) => {
  const questions = await db.query(
    `SELECT 
        qu.id,
        qu.title ,
        qu.description ,
        qu."type" ,
        qu.icon ,
        qu.isrequired ,
        qu.section_id ,
        qu.source_idtable ,
        qu.source_namesource ,
        qu.source_values ,
        qu.conditions
        , qu.placeholder
        , qu.readonly
        , qu.defaultvalue as value 
    FROM sections sec
    INNER JOIN questions qu ON qu.section_id = sec.id and sec.deleted = false
    WHERE sec.form_id = $1 AND qu.deleted = FALSE
    ORDER BY qu.id`,
    [formId]
  );
  return await Promise.all(
    questions.rows.map(async (q) => {
      q.source_values = await buildSourceFromCatalog(q.source_idtable);
      return q;
    })
  );
};

exports.getQuestionsBySection = async (sectionId) => {
  const questions = await db.query(
    `SELECT 
          qu.id,
          qu.title as text ,
          qu.description ,
          qu."type" ,
          qu.icon ,
          qu.isrequired ,
          qu.section_id ,
          qu.source_idtable ,
          qu.source_namesource ,
          qu.source_values as possibilities ,
          qu.conditions as condition
          , qu.placeholder
          , qu.readonly
          , case when qu.defaultvalue = '' then null else qu.defaultvalue end as value 
        FROM questions qu 
      WHERE qu.section_id = $1 AND qu.deleted = FALSE
      ORDER BY qu.id`,
    [sectionId]
  );
  return Promise.all(
    questions.rows.map(async (q) => {
      q.possibilities = await buildSourceFromCatalog(q.source_idtable);
      return q;
    })
  );
};
exports.associateTypeTask = async (req, user) => {
  return await Promise.all(
    req.forms.map(async (form) => {
      await db.query(
        `INSERT INTO "formsTypeTasks" ("taskId", "formId", "creationUser", required) VALUES ($1,$2, $3, $4) RETURNING id;`,
        [req.idTask, form.idForm, user.userName, form.isRequired]
      );
    })
  );
};
exports.updateAssociateTypeTask = async (taskId, req, user) => {
  return await db.query(
    `UPDATE "formsTypeTasks" 
      set "modificationDate" = now()
      , "modificationUser" = $3
      , required = $4
       WHERE "taskId" = $1 AND "formId" = $2`,
    [taskId, req.form.idForm, user.userName, req.form.isRequired]
  );
};

exports.deleteAssociateTypeTask = async (params) => {
  return await db.query(
    `DELETE FROM "formsTypeTasks" 
    WHERE "taskId" = $2 AND "formId" = $1`,
    [params.idForm, params.idTask]
  );
};

exports.deleteForm = async (params, user) => {
  return await db.query(
    `UPDATE forms set deleted = true, modification = now(), user_modification = $2
    WHERE id = $1`,
    [params.formId, user.userName]
  );
};

exports.getFormsByTask = async (taskId) => {
  const associate = await db.query(
    `SELECT ftt."formId" as "idForm"
    , ftt.required as "isRequired"
    , f2."name"  as "nameForm"
    FROM "formsTypeTasks" ftt
    INNER JOIN forms f2 ON f2.id  = ftt."formId" AND f2.deleted = FALSE AND f2.state = TRUE 
    WHERE ftt."taskId" = $1 AND ftt.deleted = FALSE AND ftt.state = TRUE  `,
    [taskId]
  );
  return associate;
};

exports.getFormByTypeOrder = async (typeOrderId) => {
  const formsRecordSet = await db.query(
    `select distinct ftt."formId" as id
        ,f2."name" 
        ,f2.description
      from "orderTypeTask" ott 
      inner join "formsTypeTasks" ftt on ftt."taskId" = ott."taskId" 
      inner join forms f2 on f2.id = ftt."formId" 
      where ott."orderTypeId"  = $1
      order by f2."name"`,
    [typeOrderId]
  );
  await Promise.all(
    formsRecordSet.rows.map(async (frm) => {
      const sectionsRecordSet = await exports.getSectionsByForm(frm.id);
      frm.sections = await Promise.all(
        sectionsRecordSet.rows.map(async (sect) => {
          return { name: sect.title, questions: await exports.getQuestionsBySection(sect.id)};
        })
      );
    })
  );
  return formsRecordSet.rows;
};

exports.getFormByTask = async (taskId) => {
  const formsRecordSet = await db.query(
    `select ftt."formId" 
        ,f2."name" 
          ,f2.description
      from "formsTypeTasks" ftt 
      inner join forms f2 on f2.id = ftt."formId" 
      where ftt."taskId" = $1
      order by f2."name"`,
    [taskId]
  );
  await Promise.all(
    formsRecordSet.rows.map(async (frm) => {
      const sectionsRecordSet = await exports.getSectionsByForm(frm.id);
      frm.sections = await Promise.all(
        sectionsRecordSet.rows.map(async (sect) => {
          return { name: sect.title, questions: await exports.getQuestionsBySection(sect.id)};
        })
      );
    })
  );
  return formsRecordSet.rows;
};