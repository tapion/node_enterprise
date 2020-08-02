const db = require('../db');

exports.CreateForm = async (req) => {
  return await db.transactions(async (client) => {
    const form = {};
    let res = await client.query(
      'INSERT INTO forms ("name", description, state, user_creation) VALUES ($1,$2,$3, 1) RETURNING id;',
      [req.name, req.description, req.state]
    );
    form.id = res.rows[0].id;

    res = await client.query(
      'INSERT INTO sections ("name", state, form_id, user_creation) VALUES ($1,$2, $3, 1) RETURNING id;',
      ['Test', true, form.id]
    );
    form.sectionId = res.rows[0].id;
    //mejora usando map, para retornar un nuevo objeto
    const newQuestions = await Promise.all(
      req.questions.map(async (question) => {
        const values = question.source.values.reduce((acc, val, idx) => {
          if (idx === 1) {
            return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
          }
          return `${acc},${JSON.stringify(val)}`;
        });
        res = await client.query(
          `INSERT INTO questions(
            title
            ,description
            ,"type"
            , icon
            , value
            , conditions
            , invalidmessagekey
            , isrequired
            , source_idtable
            , source_namesource
            , source_values
            , section_id
            , user_creation
            )
        VALUES($1,$2, $3, $4, $5,$6,$7,$8,$9,$10,$11,$12,1) RETURNING id;`,
          [
            question.title,
            question.description,
            question.type,
            question.icon,
            question.value,
            question.conditions,
            question.invalidMessageKey,
            question.isRequired,
            question.source.idTable,
            question.source.nameSource,
            `[${values}]`,
            form.sectionId,
          ]
        );
        question.id = res.rows[0].id;
        return question;
      })
    );
    req.id = form.id;
    req.questions = newQuestions;
    return req;
  });
};

// exports.test = async (values) => {
//   db.transactions(async (client) => {
//     const tmp = values.reduce((acc, val, idx) => {
//       if (idx === 1) {
//         return `${JSON.stringify(acc)},${JSON.stringify(val)}`;
//       }
//       return `${acc},${JSON.stringify(val)}`;
//     });
//     const res = await client.query(
//       'INSERT INTO hola (nombre, testjson) VALUES ($1,$2) RETURNING id;',
//       [
//         'req.name',
//         `[${tmp}]`
//         // '[{"id":"0","name":"string","value":"0","state":true},{"id":"1","name":"string","value":"0","state":true},{"id":"2","name":"string","value":"0","state":true},{"id":"3","name":"string","value":"0","state":true},{"id":"4","name":"string","value":"0","state":true}]',
//       ]
//     );
//   });
// };
