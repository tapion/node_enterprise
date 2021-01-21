const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.getWorkOrderByOperator = async (operatorId) => {
  return db.query(
    `SELECT 
          two.id AS "taskId"
          ,two."orderTypeTaskId"
          ,task.name AS "taskName"
          ,wo.id
          ,wo."orderTypeId" AS "idTypeOT"
          ,c."name" AS "typeOT"
          ,wo."clientId"
          ,wo."placesId"
          ,wo."statusId" AS "stateId"
          ,c2."name" AS "stateDescription"
          ,two."orderTypeTaskId"
          ,two."operatorId"
          ,two."creationUser"
          ,two."creationDate"
          ,two."modificationUser"
          ,two."modificationDate"
          ,two."workOrderId"
          ,two."closeTypeId"
          ,two."initialDate"
          ,two."endDate"
          ,two.status
      FROM "taskWorkOrder" two 
      inner JOIN "workOrder" wo ON two."workOrderId" = wo.id
      inner join "orderTypeTask" ott on ott.id = two."orderTypeTaskId" 
      INNER JOIN catalogue task ON task.id = ott."taskId" 
      INNER JOIN catalogue c ON c.id  = wo."orderTypeId" AND c.catalog_id = 93
      INNER JOIN catalogue c2 ON c2.id  = wo."statusId" 
      WHERE two."operatorId" = $1
      ORDER BY wo.id,wo."orderTypeId"`,
    [operatorId]
  );
};
exports.getTasksByUser = async (operatorId) => {
  //TODO: ASOCIAR USUARIOS
  return db.query(
    `select two.id as "idTask",
      c."name" as "nameTask",
      wo.id as "idOrder",
      wo.description,
      c2."name" as "state"
      ,two.status as "idStatus"
    from "taskWorkOrder" two 
    inner join "workOrder" wo on wo.id = two."workOrderId" 
    INNER join "orderTypeTask" ott on ott.id = two."orderTypeTaskId" 
    INNER join catalogue c on c.id = ott."taskId" 
    inner join catalogue c2 on c2.id = two.status
    where two."editionOnWeb" = true
    order by c."name", wo."name",two.status`
  );
};

