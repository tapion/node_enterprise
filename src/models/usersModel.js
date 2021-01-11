const db = require('../db');

exports.createUser = async (user, password) => {
  return await db.query(
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


// select 
// u.id as "userId",
// c.id as "typoDocId",
// c."name" as "typoDocName",
// c2.id as "genreId",
// c2."name" as "genreName",
// c3.iso as "countryId",
// c3."name" as "countryName"
// ,u."firstName" as "userFirstNames"
// ,u."lastName" as "userLastNames"
// ,u."pictureUrl" as "userPicture"
// ,u.email as "userEmail"
// ,u.phone as "userPhone"
// ,u."creationDate"
// ,u."creationUser" 
// ,u."modificationDate" 
// ,u."modificationUser" 
// from users u
// inner join catalogue c on c.id = u."typDocument_catalogue" 
// inner join catalogue c2 on c2.id = u."genreId_catalogue" 
// inner join countries c3 on c3.iso = u."countryIso" ;