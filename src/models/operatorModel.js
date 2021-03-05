const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.getWorkOrderByOperator = async (operatorId) => {
  return db.query(
    `SELECT 
          o2."trackingPerMinute" 
          , floor(EXTRACT(EPOCH FROM two."creationDate")) AS "dateStart"
          , floor(EXTRACT(EPOCH FROM two."creationDate" + INTERVAL '2 day')) AS "dateEnd"  
          ,o2."syncNetwork" 
          ,o2."syncWifi" 
          ,o2."uploadFilesCamera" 
          ,o2."uploadFilesGallery" 
          ,two.id AS "taskId"
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
          ,case when two."editionOnWeb" is null then  false else two."editionOnWeb" end AS "isWeb"
      FROM "taskWorkOrder" two 
      INNER JOIN operators o2 ON o2.id = two."operatorId" AND o2.deleted = false
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
exports.getTasksByUser = async (userName) => {
  return db.query(
    `select two.id as "idTask",
      c."name" as "nameTask",
      wo.id as "idOrder",
      wo.description,
      c2."name" as "state"
      ,two.status as "idStatus"
    from "taskWorkOrder" two 
    inner join operators o2 on o2.id  = two."operatorId" and o2."userName" = $1
    inner join "workOrder" wo on wo.id = two."workOrderId" 
    INNER join "orderTypeTask" ott on ott.id = two."orderTypeTaskId" 
    INNER join catalogue c on c.id = ott."taskId" 
    inner join catalogue c2 on c2.id = two.status
    where two."editionOnWeb" = true 
    order by c."name", wo."name",two.status`,
    [userName]
  );
};

