const db = require('../db');

exports.saveTemplate = async (body,user) => {
    return db.query(
        `INSERT INTO templates
            (name, description, "template", state, "creationUser")
            VALUES($1, $2, $3, $4, $5)
        RETURNING id;`,
        [body.name, body.description, body.template, body.state,user.userName]
      );
}

exports.updateTemplate = async (id,body,user) => {
    console.log(id);
    return db.query(
        `UPDATE templates 
        SET 
            name = $2,
            description = $3,
            "template" = $4,
            state = $5,
            "modificationUser"=$6,
            "modificationDate"=now()        
        WHERE id = $1`,
        [id,body.name, body.description, body.template, body.state,user.userName]
      );
}

exports.getAllTemplates = async () => {
    return db.query(
        `SELECT id,
        name,
        description,
        state,
        "creationUser",
        "creationDate",
        "modificationUser",
        "modificationDate"
        FROM templates
        WHERE deleted = FALSE
        ORDER BY "creationDate" DESC`
      );
}

exports.getTemplatesById = async (templateId) => {
    return db.query(
        `SELECT id,
        name,
        description,
        "template",
        state,
        "creationUser",
        "creationDate",
        "modificationUser",
        "modificationDate"
        FROM templates
        WHERE deleted = FALSE and id = $1
        ORDER BY "creationDate" DESC`,
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