const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.getWorkOrderByOperator = async (operatorId) => {
  return await db.query(
    `SELECT 
          task.id AS "taskId"
          ,task.name AS "taskName"
          ,wo.id
          ,wo."orderTypeId" AS "idTypeOT"
          ,c."name" AS "typeOT"
          ,wo."clientId"
          ,wo."placesId"
          ,wo."statusId" AS "stateId"
          ,c2."name" AS "stateDescription"
      FROM "taskWorkOrder" two 
      INNER JOIN "workOrder" wo ON two."workOrderId" = wo.id
      INNER JOIN catalogue task ON task.id = two."orderTypeTaskId" 
      INNER JOIN catalogue c ON c.id  = wo."orderTypeId" AND c.catalog_id = 93
      INNER JOIN catalogue c2 ON c2.id  = wo."statusId" 
      WHERE two."operatorId" = $1
      ORDER BY wo.id,wo."orderTypeId"`,
    [operatorId]
  );
};
