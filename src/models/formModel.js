const db = require('../db');

exports.CreateForm = async (body, sec, quest) => {
  return await db.transactions(async (client) => {
    const form = {};
    let res = await client.query(
      'INSERT INTO forms ("name", description, state, user_creation) VALUES ($1,$2,$3, $4) RETURNING id;',
      [body.name, body.description, body.state, body.userName]
    );
    form.id = res.rows[0].id;
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
    const newQuestions = await Promise.all(
      quest.map(async (question) => {
        let values = '';
        if (question.source.length > 0) {
          values = question.source.reduce((acc, val, idx) => {
            if (idx === 1) {
              return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
            }
            return `${acc},${JSON.stringify(val)}`;
          });
        } else {
          values = '';
        }
        let condition = '';
        if (question.conditions > 0) {
          condition = question.conditions.reduce((acc, val, idx) => {
            if (idx === 1) {
              return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
            }
            return `${acc},${JSON.stringify(val)}`;
          });
        } else {
          condition = '';
        }
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
        question.id = res.rows[0].id;
        question.section_idk = sectionId;
        return question;
      })
    );
    body.id = form.id;
    body.questions = newQuestions;
    return { body, sec, quest };
  });
};

