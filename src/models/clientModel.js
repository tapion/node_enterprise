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
