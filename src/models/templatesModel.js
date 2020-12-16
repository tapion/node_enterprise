const db = require('../db');

exports.saveTemplate = async (body,user) => {
    return db.query(
        `INSERT INTO templates
            (name, description, "template", state, "creationUser","orderTypeId")
            VALUES($1, $2, $3, $4, $5,$6)
        RETURNING id;`,
        [body.name, body.description, body.template, body.state,user.userName, body.orderTypeId]
      );
}

exports.updateTemplate = async (id,body,user) => {
    return db.query(
        `UPDATE templates 
        SET 
            name = $2,
            description = $3,
            "template" = $4,
            state = $5,
            "modificationUser"=$6,
            "modificationDate"=now(),
            "orderTypeId" = $7    
        WHERE id = $1`,
        [id,body.name, body.description, body.template, body.state,user.userName, body.orderTypeId]
      );
}

exports.getAllTemplates = async () => {
    return db.query(
        `SELECT t.id,
            t.name,
            t.description,
            t.state,
            t."template",
            t."creationUser",
            t."creationDate",
            t."modificationUser",
            t."modificationDate",
            t."orderTypeId",
            c2."name" as "orderTypeName"
        FROM templates t
        inner join catalogue c2 on c2.id = t."orderTypeId" 
        WHERE t.deleted = FALSE
        ORDER BY t."creationDate" DESC`
      );
}

exports.getTemplatesById = async (templateId) => {
    return db.query(
        `SELECT t.id,
            t.name,
            t.description,
            t."template",
            t.state,
            t."creationUser",
            t."creationDate",
            t."modificationUser",
            t."modificationDate",
            t."orderTypeId",
            c2."name" as "orderTypeName"
        FROM templates t
        inner join catalogue c2 on c2.id = t."orderTypeId" 
        WHERE t.deleted = FALSE and t.id = $1
        ORDER BY t."creationDate" DESC`,
        [templateId]
      );
}
exports.deleteTemplate = async (templateId,user) => {
    return db.query(
        `UPDATE templates 
            SET 
            "modificationUser"=$2,
            deleted=true,
            "modificationDate"=now()        
        WHERE id = $1`,
        [templateId,user.userName]
      );
}