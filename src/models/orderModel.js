const bent = require('bent');
const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.saveTypeOrderAndTask = async (req, user) => {
  return await Promise.all(
    req.tasks.map(async (form) => {
      await db.query(
        `INSERT INTO "orderTypeTask" ("orderTypeId", "taskId", "creationUser", state) VALUES ($1,$2, $3, $4) RETURNING id;`,
        [req.idTypeOrder, form.idTask, user.userName, form.status]
      );
    })
  );
};
exports.updateTypeOrderAndTask = async (req, idTypeOrder, user) => {
  return await Promise.all(
    req.tasks.map(async (form) => {
      const result = await db.query(
        `UPDATE "orderTypeTask" set state = $3, 
        "modificationUser" = $4, 
        "modificationDate" = now() 
        WHERE "orderTypeId" = $1 AND "taskId" = $2 AND deleted = false`,
        [idTypeOrder, form.idTask, form.status, user.userName]
      );
      if (result.rowCount === 0) {
        await db.query(
          `INSERT INTO "orderTypeTask" ("orderTypeId", "taskId", "creationUser", state) VALUES ($1,$2, $3, $4) RETURNING id;`,
          [idTypeOrder, form.idTask, user.userName, form.status]
        );
      }
    })
  );
};
exports.deleteTypeOrderAndTask = async (req, user) => {
  return await db.query(
    `UPDATE "orderTypeTask" set deleted = true, "modificationUser"=$3, "modificationDate"=now()
    WHERE "orderTypeId" = $1 AND "taskId" = $2 AND deleted = false`,
    [req.idTypeOrder, req.idTask, user.userName]
  );
};
exports.getAllTypeOrderAndTask = async (idTypeOrder) => {
  try {
    const tasks = await db.query(
      `SELECT "taskId" as "idTask"
        ,state as status
        FROM "orderTypeTask"
        WHERE "orderTypeId" = $1 AND deleted = false`,
      [idTypeOrder]
    );
    const caller = bent(`${process.env.CATALOG_HOST}`, 'GET', 'json', 200);
    //CONTROLAR CUNADO HAY ERROR
    const response = await caller(`/v1/options/${process.env.CTG_TASKID}`);
    tasks.rows.forEach((task) => {
      const catNameTask = response.data.filter(
        (cTaks) => cTaks.id === task.idTask
      );
      task.nameTask = catNameTask[0].name;
    });
    return tasks.rows;
  } catch (e) {
    console.log('error***', e);
    throw e;
  }
};
