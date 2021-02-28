const db = require('../db');

exports.getAllRoles = async () => {
  return db.query(
        `select
        r.id as "roleId",
        r."name" as "roleName",
        r.description as "roleDescription",
        r.status as "active",
        u."userName" as "creationUser",
        r."creationDate" ,
        u2."userName" as "modificationUser" ,
        r."modificationDate" 
      from roles r 
      inner join users u on u."userName" = r."creationUser"
      left join users u2 on u2."userName" = r."modificationUser" 
      where r.deleted = false
      order by r."name" `
      );
};
exports.getRolById = async (rolId) => {
  return db.query(
        `select
        r.id as "roleId",
        r."name" as "roleName",
        r.description as "roleDescription",
        r.status as "active",
        u."userName" as "creationUser",
        r."creationDate" ,
        u2."userName" as "modificationUser" ,
        r."modificationDate" 
      from roles r 
      inner join users u on u."userName" = r."creationUser"
      left join users u2 on u2."userName" = r."modificationUser" 
      where r.deleted = false and r.id = $1
      order by r."name" `, [rolId]
      );
};

const saveMenuOptions = async (client,menu) => {
  return client.query(
    `INSERT INTO "menuOptionsByRole"
    ("menuOptionId", rolid, "read", "write", "delete", "creationUser")
    VALUES($1, $2, $3, $4, $5, $6)`,
    [
      menu.id,
      menu.rol,
      menu.read,
      menu.write,
      menu.delete,
      menu.userName
    ]
  );
}

const validateParentAndRoot = async (client,parent,menu,parents) => {
  if(parent && !parents.includes(parent)){
    menu.id = parent;
    await saveMenuOptions(client,menu);
    return [...parents,parent];
  }
  return parents;
}

const insertMenuOptions = async (client,rolId,body,userName) => {
  let parents = [];  
  return Promise.all(body.menuOptions.map(async opc => {
    const menu = {
      id: 0,
      rol: rolId,
      read: true,
      write: true,
      delete: true,
      userName: userName,
    }
    parents = await validateParentAndRoot(client,opc.root,menu,parents);
    parents = await validateParentAndRoot(client,opc.parent,menu,parents);
    menu.id = opc.id;
    menu.read = opc.read;
    menu.write = opc.write;
    menu.delete = opc.delete;
    return saveMenuOptions(client,menu);
  }));
}

exports.saveRol = async (body,user) => {
  return db.transactions(async (client) => {
    const rol = await client.query(
          `INSERT INTO public.roles
          ("name", description, status, "creationUser")
          VALUES($1, $2, $3, $4) RETURNING id;`,
          [body.roleName,body.roleDescription,body.active,user.userName]
    );
    await insertMenuOptions(client,rol.rows[0].id,body,user.userName);
    return rol; 
  });
};

exports.updateRolById = async (id,body,user) => {
  return db.transactions(async (client) => {
    const recordset = await client.query(
      `UPDATE roles
      SET "name"=$2, description=$3, 
        status=$4, 
        "modificationUser"=$5, 
        "modificationDate"=now()
      WHERE id=$1 and deleted=false`,
      [
        id,
        body.roleName,
        body.roleDescription,
        body.active,
        user.userName
      ]
    );

    await client.query(
      `DELETE FROM "menuOptionsByRole"
      WHERE rolId=$1`,
      [
        id,
      ]
    );

    await insertMenuOptions(client,id,body,user.userName);
    return recordset;
  });
};

exports.deleteRolById = async (id,user) => {
  return db.query(
        `UPDATE roles
        SET deleted = true,
          "modificationUser"=$2, 
          "modificationDate"=now()
        WHERE id=$1 and deleted=false`,
        [
          id,
          user.userName
        ]
      );
};
exports.menuOptionsByRolId = async (rolId) => {
  return db.query(
        `select mobr."menuOptionId" as id
          ,mobr."read" 
          ,mobr."write" 
          ,mobr."delete" 
        from "menuOptionsByRole" mobr 
        inner join "menuOptions" mo on mo.id = mobr."menuOptionId" and mo.status = true and mo.deleted = false
        where mobr.rolid = $1 and mobr.status = true and mobr.deleted = false
        order by mo."order", mo."name"`,
        [
          rolId
        ]
      );
};