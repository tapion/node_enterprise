const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.getWorkOrderByOperator = async (operatorId) =>{
    return await db.query(
        `SELECT 
            wo.id
            ,wo."orderTypeId" AS "idTypeOT"
            ,c."name" AS "typeOT"
            ,wo."clientId"
            ,wo."placesId"
            ,wo."stateId" AS "stateId"
            ,c2."name" AS "stateDescription"
        FROM "workOrder" wo 
        INNER JOIN catalogue c ON c.id  = wo."orderTypeId" AND c.catalog_id = 93
        INNER JOIN catalogue c2 ON c2.id  = wo."stateId" 
        WHERE wo."operarioId" = $1`,
        [operatorId]
    );
}

//121