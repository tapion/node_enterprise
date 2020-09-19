const bent = require('bent');
const dotenv = require('dotenv');
const db = require('../db');

let previusRequest;

dotenv.config({ path: './config.env' });

exports.types = [
  { id: 0, front: 'LABEL', mobile: '' },
  { id: 1, front: 'TEXT', mobile: 'Text' },
  { id: 2, front: 'RADIOGROUP', mobile: 'Radio' },
  { id: 3, front: 'CHECKGROUP', mobile: 'CheckTable' },
  { id: 4, front: 'TEXTAREA', mobile: 'Text' },
  { id: 5, front: 'COMBOBOX', mobile: 'Pick' },
  { id: 6, front: 'SECTION', mobile: '' },
  { id: 7, front: 'NUMBER', mobile: 'Number' },
  { id: 8, front: 'IMAGE', mobile: 'Photo' },
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

const createCatalogs = async (quest, username) => {
  try {
    const post = bent(`${process.env.CATALOG_HOST}`, 'POST', 'json', 200);
    return await Promise.all(
      quest.map(async (q) => {
        if (q.nameSource) {
          q.idTable = await consumeCatalogs(
            {
              name: q.nameSource,
              status: true,
              userName: username,
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
                  userName: username,
                  value: q1.value,
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
    const obj = await e.json();
    obj.message = `${obj.message}, with catalog ${JSON.stringify(
      previusRequest
    )} `;
    throw obj;
  }
};
exports.CreateForm = async (body, sec, quest) => {
  quest = await createCatalogs(quest, body.userName);
  return await db.transactions(async (client) => {
    const form = {};
    let res = await client.query(
      'INSERT INTO forms ("name", description, state, user_creation) VALUES ($1,$2,$3, $4) RETURNING id;',
      [body.name, body.description, body.state, body.userName]
    );
    form.id = res.rows[0].id;
    //Sections
    const newSections = await Promise.all(
      sec.map(async (section) => {
        res = await client.query(
          'INSERT INTO sections ("name", state, form_id, user_creation) VALUES ($1,$2, $3, $4) RETURNING id;',
          [section.title, section.isRequired, form.id, body.userName]
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
        if (!question.isNew)
          throw new Error(
            `All elements must be new, this is a old one id ${question.id}`
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
            body.userName,
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
    return { body, sec, quest };
  });
};

exports.getFormById = async (formId) => {
  return await db.query(
    'SELECT id, "name", description, state, user_creation FROM forms WHERE id = $1 AND deleted = FALSE',
    [formId]
  );
};

exports.getFormsByOrderType = async (orderType) => {
  return await db.query(
    `SELECT
        f2.id,
        f2."name",
        f2.description,
        f2.state,
        f2.user_creation
      FROM
        "orderTypeTask" ott
      INNER JOIN "formsTypeTasks" ftt ON
        ftt."taskId" = ott."taskId" AND ftt.state = TRUE  AND ftt.deleted = FALSE 
      INNER JOIN forms f2 ON f2.id = ftt."formId" AND f2.state = TRUE  AND f2.deleted = FALSE 
      WHERE
        ott."orderTypeId" = $1 AND ott.state = TRUE AND ott.deleted = FALSE  `,
    [orderType]
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
          qu.source_values as posibilities ,
          qu.conditions as condition
          , qu.placeholder
          , qu.readonly
          , qu.defaultvalue as value 
        FROM questions qu 
      WHERE qu.section_id = $1 AND qu.deleted = FALSE
      ORDER BY qu.id`,
    [sectionId]
  );
  return await Promise.all(
    questions.rows.map(async (q) => {
      q.posibilities = await buildSourceFromCatalog(q.source_idtable);
      return q;
    })
  );
};
exports.associateTypeTask = async (req) => {
  return await Promise.all(
    req.forms.map(async (form) => {
      await db.query(
        `INSERT INTO "formsTypeTasks" ("taskId", "formId", "creationUser", required) VALUES ($1,$2, $3, $4) RETURNING id;`,
        [req.idTask, form.idForm, req.idUser, form.isRequired]
      );
    })
  );
};
exports.updateAssociateTypeTask = async (taskId, req) => {
  return await db.query(
    `UPDATE "formsTypeTasks" 
      set "modificationDate" = now()
      , "modificationUser" = $3
      , required = $4
       WHERE "taskId" = $1 AND "formId" = $2`,
    [taskId, req.form.idForm, req.idUser, req.form.isRequired]
  );
};

exports.deleteAssociateTypeTask = async (params, userId) => {
  return await db.query(
    `DELETE FROM "formsTypeTasks" 
    WHERE "taskId" = $2 AND "formId" = $1`,
    [params.idForm, params.idTask]
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
