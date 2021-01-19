const db = require('../db');

exports.createUser = async (body, user,password) => {
  const roles = body.roles.map(rol => rol.id);
  return db.query(
    `INSERT INTO users
    (email, "userName", "firstName", "password", state, "creationUser", "typDocument_catalogue"
    , "genreId_catalogue", "lastName", "pictureUrl", phone, "rolesId", "countryIso", "documentId")
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id;`,
    [
      body.email, 
      body.login,
      body.firstNames,
      password,
      body.active,
      user.userName,
      body.identificationType.id,
      body.genre.id,
      body.lastNames,
      body.picture,
      body.phone,
      roles,
      body.country.iso,
      body.identificationNumber
    ]
  );
};

exports.updateUser = async (userId,body, user) => {
  const roles = body.roles.map(rol => rol.id);
  return db.query(
    `UPDATE public.users
      SET "userName"=$1
        , "firstName"=$2
        , state=$3
        , "modificationUser"=$4
        , "modificationDate"=now()
        , "typDocument_catalogue"=$5
        , "genreId_catalogue"=$6
        , "lastName"=$7
        , "pictureUrl"=$8
        , phone=$9
        , "rolesId"=$10
        , "countryIso"=$11
        , "documentId"=$12
        , email=$13
      WHERE id = $14`,
    [
      body.login,
      body.firstNames,
      body.active,
      user.userName,
      body.identificationType.id,
      body.genre.id,
      body.lastNames,
      body.picture,
      body.phone,
      roles,
      body.country.iso,
      body.identificationNumber,
      body.email,
      userId
    ]
  );
};

exports.getUser = async (email) => {
  return db.query(
    `SELECT email, users."userName", users."firstName" || ' ' || users."lastName" as name
        , password
        , "changedPasswordAt" 
        , o2.id as "operatorId"
        , users."rolesId"
      FROM users 
      left join operators o2 on o2."userName" = users."userName" and o2.active = true
      where email = $1 
      and state = true and deleted = false`,
    [email]
  );
};

exports.getUserByIdForPassword = async (userId) => {
  return db.query(
    `SELECT password
      FROM users       
      where id = $1 
      and state = true and deleted = false`,
    [userId]
  );
};

exports.updatePassword = async (userId,password) => {
  return db.query(
    `UPDATE users 
        set password = $2
        , "changedPasswordAt" = now()
      where id = $1 
      and state = true and deleted = false`,
    [userId,password]
  );
};

exports.deleteById = async (userId,user) => {
  return db.query(
    `UPDATE users  
      SET
        deleted = true,
        "modificationUser" = $1,
        "modificationDate" = now()
      where id = $2 and deleted = false`,
    [user.userName,userId]
  );
};

const getRolsByUserId = async (userId) => {
  return db.query(
    `select r.id
        ,r."name" 
      from users u 
      inner join roles r on r.id = ANY(u."rolesId") and r.deleted = false and r.status = true
      where u.id = $1
      order by r."name"`,
      [userId]
  );
};

const constructResponse = async (user) => {
  const roles = await getRolsByUserId(user.id);
  return {
    id:user.id,
    identificationType: {
      id: user.typoDocId,
      name: user.typoDocName
    },
    identificationNumber: user.documentId,
    genre: {
      id: user.genreId,
      name: user.genreName,
    },
    country: {
      iso: user.countryId,
      name: user.countryName,
    },
    firstNames: user.firstName,
    lastNames: user.lastName,
    picture: user.pictureUrl,
    login: user.userName,
    email: user.email,
    phone: user.phone,
    active: user.state,
    creationUser: user.creationUser,
    creationDate: user.creationDate,
    modificationUser: user.modificationUser,
    modificationDate: user.modificationDate,
    roles: roles.rows,      
  }
}


exports.getAllUsers = async () => {
  const usersRecorSet = await db.query(
    `select 
      u.id ,
      c.id as "typoDocId",
      c."name" as "typoDocName",
      u."documentId", 
      c2.id as "genreId",
      c2."name" as "genreName",
      c3.iso as "countryId",
      c3."name" as "countryName"
      ,u."firstName"
      ,u."lastName"
      ,u."pictureUrl"
      ,u."userName" 
      ,u.email
      ,u.phone
      ,u.state 
      ,u."creationDate"
      ,u."creationUser" 
      ,case when u."modificationDate" is null then  u."creationDate" else u."modificationDate" end as "modificationDate"
      ,case when u."modificationUser" is null then  u."creationUser" else u."modificationUser" end as "modificationUser"
    from users u
    inner join catalogue c on c.id = u."typDocument_catalogue" and (c.deleted = false or c.deleted is null)
    inner join catalogue c2 on c2.id = u."genreId_catalogue" and (c2.deleted = false or c2.deleted is null)
    inner join countries c3 on c3.iso = u."countryIso" 
    where u.state = true and u.deleted = false
    order by u."creationDate" desc;`
  );  
  const response = await Promise.all(usersRecorSet.rows.map(async user => {
    return constructResponse(user);
  }));
  return response;
};


exports.getUserById = async (userId) => {
  const usersRecorSet = await db.query(
    `select 
      u.id ,
      c.id as "typoDocId",
      c."name" as "typoDocName",
      u."documentId", 
      c2.id as "genreId",
      c2."name" as "genreName",
      c3.iso as "countryId",
      c3."name" as "countryName"
      ,u."firstName"
      ,u."lastName"
      ,u."pictureUrl"
      ,u."userName" 
      ,u.email
      ,u.phone
      ,u.state 
      ,u."creationDate"
      ,u."creationUser" 
      ,case when u."modificationDate" is null then  u."creationDate" else u."modificationDate" end as "modificationDate"
      ,case when u."modificationUser" is null then  u."creationUser" else u."modificationUser" end as "modificationUser"
    from users u
    inner join catalogue c on c.id = u."typDocument_catalogue" and (c.deleted = false or c.deleted is null)
    inner join catalogue c2 on c2.id = u."genreId_catalogue" and (c2.deleted = false or c2.deleted is null)
    inner join countries c3 on c3.iso = u."countryIso" 
    where u.state = true and u.deleted = false and u.id = $1
    order by u."creationDate" desc;`, [userId]
  );  
  return constructResponse(usersRecorSet.rows[0]);
};
