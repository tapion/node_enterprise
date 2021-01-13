const db = require('../db');

exports.createUser = async (user, password) => {
  return db.query(
    `INSERT INTO users (email, "userName", name, password, "creationUser") 
      VALUES ($1, $2, $3, $4, $5)`,
    [user.email, user.userName, user.name, password, 'miguel.vargas']
  );
};

exports.getUser = async (email) => {
  return db.query(
    `SELECT email, "userName", "firstName" || ' ' || "lastName" as name, password, "changedPasswordAt" FROM users where email = $1 
      and state = true and deleted = false`,
    [email]
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
      ,u."modificationDate" 
      ,u."modificationUser" 
    from users u
    inner join catalogue c on c.id = u."typDocument_catalogue" and (c.deleted = false or c.deleted is null)
    inner join catalogue c2 on c2.id = u."genreId_catalogue" and (c2.deleted = false or c2.deleted is null)
    inner join countries c3 on c3.iso = u."countryIso" 
    where u.state = true and u.deleted = false
    order by u."creationDate" desc;`
  );  
  const response = await Promise.all(usersRecorSet.rows.map(async user => {
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
      creationUser: user.creationDate,
      creationDate: user.creationUser,
      modificationUser: user.modificationDate,
      modificationDate: user.modificationUser,
      roles: roles.rows,      
    }
  }));
  return response;
};
