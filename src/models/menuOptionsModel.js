const db = require('../db');

exports.getAllMenuOptions = async (secId = null,roles) => {
  let sections;
  if(secId === null){
    sections = await db.query(
          `select mo.id 
          ,mo."name" 
          ,mo.icon
          ,mo."path" 
        from "menuOptions" mo 
        --inner join "menuOptionsByRole" mobr on mobr."menuOptionId" = mo.id and mobr.rolid in (${roles})
        where mo.parent is null and mo.status = true and mo.deleted = false
        order by mo."order"`
        );
  }else{
    sections = await db.query(`select mo.id 
          ,mo."name" 
          ,mo.icon
          ,mo."path" 
        from "menuOptions" mo 
        --inner join "menuOptionsByRole" mobr on mobr."menuOptionId" = mo.id and mobr.rolid in (${roles})
        where mo.parent = $1 and mo.status = true and mo.deleted = false
        order by mo."name"
        `,[secId]);
  }
  if(sections.rowCount === 0) return undefined;
  return Promise.all(sections.rows.map(async sec => {
    const children = await exports.getAllMenuOptions(sec.id, roles);
    return {...sec,menuSections: children}
  }))
};