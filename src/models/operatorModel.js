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
          ,wo."stateId" AS "stateId"
          ,c2."name" AS "stateDescription"
      FROM "workOrder" wo 
      INNER JOIN "orderTypeTask" ott ON ott."orderTypeId" = wo."orderTypeId" 
      INNER JOIN catalogue task ON task.id = ott."taskId" 
      INNER JOIN catalogue c ON c.id  = wo."orderTypeId" AND c.catalog_id = 93
      INNER JOIN "taskWorkOrder" two ON two."workOrderId" = wo.id AND two."orderTypeTaskId" = task.id 
      INNER JOIN catalogue c2 ON c2.id  = wo."stateId" 
      WHERE wo."operarioId" = $1
      ORDER BY wo.id,wo."orderTypeId"`,
    [operatorId]
  );
};
