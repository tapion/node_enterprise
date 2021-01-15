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
        where mo.parent is null and mo.status = true and mo.deleted = false
          and  mo.id in (
            select mobr."menuOptionId" 
            from "menuOptionsByRole" mobr 
            where mobr."menuOptionId" = mo.id and mobr.rolid in (${roles})
          )
        order by mo."order"`
        );
  }else{
    sections = await db.query(`select mo.id 
          ,mo."name" 
          ,mo.icon
          ,mo."path" 
        from "menuOptions" mo 
        where mo.parent = $1 and mo.status = true and mo.deleted = false
          and  mo.id in (
            select mobr."menuOptionId" 
            from "menuOptionsByRole" mobr 
            where mobr."menuOptionId" = mo.id and mobr.rolid in (${roles})
          )
      order by mo."name"
        `,[secId]);
  }
  if(sections.rowCount === 0) return undefined;
  return Promise.all(sections.rows.map(async sec => {
    const children = await exports.getAllMenuOptions(sec.id, roles);
    return {...sec,menuSections: children}
  }))
};
exports.getAllOptionsAsignedWithoutPath = async (secId = null) => {
  let sections;
  if(secId === null){
    sections = await db.query(
          `select mo.id 
          ,mo."name" 
          ,mo.icon
        from "menuOptions" mo 
        where mo.parent is null and mo.status = true and mo.deleted = false
        order by mo."order"`
        );
  }else{
    sections = await db.query(`select mo.id 
          ,mo."name" 
          ,mo.icon
        from "menuOptions" mo 
        where mo.parent = $1 and mo.status = true and mo.deleted = false
        order by mo."name"
        `,[secId]);
  }
  if(sections.rowCount === 0) return undefined;
  return Promise.all(sections.rows.map(async sec => {
    const children = await exports.getAllOptionsAsignedWithoutPath(sec.id);
    return {...sec,menuSections: children}
  }))
};