const db = require('../db');

const createJsonFromArray = (arr) => {
  if (arr.length > 0) {
    return arr.reduce((acc, val, idx) => {
      if (idx === 1) {
        return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
      }
      return `${acc},${JSON.stringify(val)}`;
    });
  }
  return '';
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
        const values = createJsonFromArray(question.source);
        const condition = createJsonFromArray(question.conditions);
        const sectionId = newSections.find((el) => el.id == question.idSection)
          .idk;
        res = await client.query(
          `INSERT INTO questions(
            title
            ,description
            ,"type"
            , icon
            , conditions
            , isrequired
            , source_idtable
            , source_namesource
            , source_values
            , section_id
            , user_creation
            )
        VALUES($1,$2, $3, $4, $5,$6,$7,$8,$9,$10,$11) RETURNING id;`,
          [
            question.title,
            question.description,
            question.type,
            question.icon,
            `[${condition}]`,
            question.isRequired,
            question.idTable,
            question.nameSource,
            `[${values}]`,
            sectionId,
            body.userName,
          ]
        );
        question.idk = res.rows[0].id;
        question.section_idk = sectionId;
        return question;
      })
    );
    body.id = form.id;
    body.questions = newQuestions;
    return { body, sec, quest };
  });
};

exports.getFormById = async (formId) => {
  return await db.query(
    'SELECT id, "name", description, state, user_creation FROM forms WHERE id = $1',
    [formId]
  );
};
exports.getSectionsByForm = async (formId) => {
  return await db.query(
    'SELECT id, "name" as title, state FROM sections WHERE form_id = $1',
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
    FROM sections sec
    INNER JOIN questions qu ON qu.section_id = sec.id
    WHERE sec.form_id = $1`,
    [formId]
  );
};
