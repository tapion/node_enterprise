const db = require('../db');

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

exports.CreateForm = async (body, sec, quest) => {
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

exports.getForms = async (limitId) => {
  return await db.query(
    'SELECT id, "name", description, state, user_creation FROM forms WHERE deleted = FALSE ORDER BY id DESC LIMIT $1 ',
    [limitId]
  );
};
exports.getSectionsByForm = async (formId) => {
  return await db.query(
    'SELECT id, "name" as title, state FROM sections WHERE form_id = $1 AND deleted = FALSE ORDER BY id',
    [formId]
  );
};
exports.getQuestionsByForm = async (formId) => {
  return await db.query(
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
};
exports.getQuestionsBySection = async (sectionId) => {
  return await db.query(
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
};
