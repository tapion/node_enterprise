//const dotenv = require('dotenv');
const db = require('../db');

const createContactsByOffice = async (instance, office, contacts, user) => {
  return await Promise.all(
    contacts.map(async (contact) => {
      const tmp = await instance.query(
        `INSERT INTO "customersContacts" ("name", email, phone, "customerId", "creationUser")
      VALUES($1,$2,$3,$4,$5) RETURNING id;
      `,
        [contact.name, contact.email, contact.phone, office.id, user.name]
      );
      contact.id = tmp.rows[0].id;
      return contact;
    })
  );
};

const createOffices = async (instance, office, parentOffice, user) => {
  const resOffice = await instance.query(
    `INSERT INTO customers
      ("document", "name", adress, 
      email, phone, "creationUser", "countryIso", "cityId", "customerId")
    VALUES($1, $2, $3, $4, $5,$6,$7,$8,$9) RETURNING id;
    `,
    [
      office.nit,
      office.businessName,
      office.address,
      office.email,
      office.phone,
      user.name,
      office.country,
      office.city,
      parentOffice.id,
    ]
  );
  office.id = resOffice.rows[0].id;
  office.contacts = await createContactsByOffice(
    instance,
    office,
    office.contacts,
    user
  );
  return office;
};

exports.createClient = async (body, user) => {
  return await db.transactions(async (client) => {
    const mainOffice = await createOffices(client, body, { id: null }, user);
    const offices = await Promise.all(
      body.offices.map(async (office) => {
        return await createOffices(client, office, mainOffice, user);
      })
    );
    const respOffice = { ...mainOffice };
    respOffice.offices = offices;
    return respOffice;
  });
};

exports.allCostumers = async () => {
  return await db.query(`SELECT
  c.id ,
  c."document" as nit,
  c."name"  as "businessName",
  c.adress as address ,
  c.email ,
  c.phone ,
  c3."name" as country,
  c2.city
  ,c.status 
  ,(SELECT count(*) FROM customers c4 WHERE c4."customerId" = c.id) AS offices
  FROM customers c 
  INNER JOIN cities c2 ON c2.id = c."cityId" AND c2.deleted = FALSE AND c2.state = TRUE 
  INNER JOIN countries c3 ON c3.deleted = FALSE AND c3.state = TRUE AND c3.iso = c2."countryIso" 
  WHERE c."customerId" IS NULL
  ORDER BY c."name"`);
};
