const db = require('../db');

const getChildrenOptions = async (sectionId) => {
  return db.query(`select mo.id 
        ,mo."name" 
        ,mo.icon
        ,mo."path" 
      from "menuOptions" mo 
      where mo.parent = $1 and mo.status = true and mo.deleted = false
      order by mo."name"
      `,[sectionId]);
}

exports.getAllMenuOptions = async () => {
  const sections = await db.query(
        `select mo.id 
        ,mo."name" 
        ,mo.icon
        ,mo."path" 
      from "menuOptions" mo 
      where mo.parent is null and mo.status = true and mo.deleted = false
      order by mo."order" ;`
      );
  return Promise.all(sections.rows.map(async sec => {
    const children = await getChildrenOptions(sec.id);
    return {...sec,menuOptions: children.rows}
  }))
};
// exports.getRolById = async (rolId) => {
//   return db.query(
//         `select
//         r.id as "roleId",
//         r."name" as "roleName",
//         r.description as "roleDescription",
//         r.status as "active",
//         u."userName" as "creationUser",
//         r."creationDate" ,
//         u2."userName" as "modificationUser" ,
//         r."modificationDate" 
//       from roles r 
//       inner join users u on u."userName" = r."creationUser"
//       left join users u2 on u2."userName" = r."modificationUser" 
//       where r.deleted = false and r.id = $1
//       order by r."name" `, [rolId]
//       );
// };
// exports.saveRol = async (body,user) => {
//   return db.query(
//         `INSERT INTO public.roles
//         ("name", description, status, "creationUser")
//         VALUES($1, $2, $3, $4) RETURNING id;`,
//         [body.roleName,body.roleDescription,body.active,user.userName]
//       );
// };

// exports.updateRolById = async (id,body,user) => {
//   return db.query(
//         `UPDATE roles
//         SET "name"=$2, description=$3, 
//           status=$4, 
//           "modificationUser"=$5, 
//           "modificationDate"=now()
//         WHERE id=$1 and deleted=false`,
//         [
//           id,
//           body.roleName,
//           body.roleDescription,
//           body.active,
//           user.userName
//         ]
//       );
// };

// exports.deleteRolById = async (id,user) => {
//   return db.query(
//         `UPDATE roles
//         SET deleted = true,
//           "modificationUser"=$2, 
//           "modificationDate"=now()
//         WHERE id=$1 and deleted=false`,
//         [
//           id,
//           user.userName
//         ]
//       );
// };