const db = require('../db');
const AppError = require('../utils/appError');

const createContactsByOffice = async (instance, office, contacts, user) => {
  if (!contacts) return null;
  return await Promise.all(
    contacts.map(async (contact) => {
      if (!contact.id) {
        console.log('crea contacto ', contact.name);
        const tmp = await instance.query(
          `INSERT INTO "customersContacts" ("name", email, phone, "customerId", "creationUser")
      VALUES($1,$2,$3,$4,$5) RETURNING id;
      `,
          [contact.name, contact.email, contact.phone, office.id, user.name]
        );
        contact.id = tmp.rows[0].id;
      } else {
        await instance.query(
          `UPDATE "customersContacts"
        SET "name"=$1, email=$2, phone=$3, "customerId"=$4, "modificationUser"=$5
        , "modificationDate"=now(), state=$6
        WHERE id=$7`,
          [
            contact.name,
            contact.email,
            contact.phone,
            office.id,
            user.name,
            contact.state,
            contact.id,
          ]
        );
      }
      return contact;
    })
  );
};

const createOffices = async (instance, office, parentOffice, user) => {
  const resOffice = await instance.query(
    `INSERT INTO customers
      ("document", "name", address, 
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

const updateOffices = async (instance, office, user) => {
  await instance.query(
    `UPDATE customers
      SET "document"=$1, "name"=$2, address=$3, email=$4, phone=$5
        , status=$6, "modificationUser"=$7, "modificationDate"=now()
        , "countryIso"=$8, "cityId"=$9
  WHERE id=$10;
  `,
    [
      office.nit,
      office.businessName,
      office.address,
      office.email,
      office.phone,
      office.state,
      user.name,
      office.country,
      office.city,
      office.id,
    ]
  );

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
  c.address as address ,
  c.email ,
  c.phone ,
  c3."name" as country,
  c2.city
  ,c.status as state
  ,(SELECT count(*) FROM customers c4 WHERE c4."customerId" = c.id) AS offices
  FROM customers c 
  INNER JOIN cities c2 ON c2.id = c."cityId" AND c2.deleted = FALSE AND c2.state = TRUE 
  INNER JOIN countries c3 ON c3.deleted = FALSE AND c3.state = TRUE AND c3.iso = c2."countryIso" 
  WHERE c."customerId" IS NULL and c.deleted = FALSE
  ORDER BY c."name"`);
};

const getContactsByOffice = async (office) => {
  return await db.query(
    `SELECT 
    cc.id 
    ,cc."name" 
    ,cc.email 
    ,cc.phone 
    ,cc.state 
    FROM "customersContacts" cc 
    WHERE cc."customerId" = $1 AND cc.deleted = FALSE `,
    [office]
  );
};
const getOfficesByParent = async (parent) => {
  return await await db.query(
    `SELECT 
    c.id 
    ,c."document" AS nit 
    ,c."name" AS "businessName"
    ,c.address 
    ,c.phone 
    ,c.email 
    ,c."countryIso" AS country
    ,c."cityId"  AS city
    ,c.status AS state
    FROM customers c
    WHERE c.deleted = FALSE AND c."customerId" = $1 `,
    [parent]
  );
};

exports.getCustomerById = async (customerId) => {
  const mainOffice = await db.query(
    `SELECT 
  c.id 
  ,c."document" AS nit 
  ,c."name" AS "businessName"
  ,c.address 
  ,c.phone 
  ,c.email 
  ,c."countryIso" AS country
  ,c."cityId"  AS city
  ,c.status AS state
  FROM customers c
  WHERE c.deleted = FALSE AND c."customerId" IS NULL AND c.id = $1`,
    [customerId]
  );
  if (mainOffice.rows <= 0) throw new AppError('Customer does not exist', 404);
  const mainContacts = await getContactsByOffice(customerId);
  const otherOffices = await getOfficesByParent(customerId);
  const offices = await Promise.all(
    otherOffices.rows.map(async (off) => {
      const tmp = await getContactsByOffice(off.id);
      off.contacts = tmp.rows;
      return off;
    })
  );
  const customer = mainOffice.rows[0];
  customer.contacts = mainContacts.rows;
  customer.offices = offices;
  return customer;
};
exports.deleteCustomer = async (costumerId, user) => {
  return await db.query(
    `UPDATE customers set deleted = true , "modificationDate"=now(), "modificationUser"=$2
    where id = $1`,
    [costumerId, user.name]
  );
};
exports.updateClient = async (body, user) => {
  return await db.transactions(async (client) => {
    const mainOffice = await updateOffices(client, body, user);
    const offices = await Promise.all(
      body.offices.map(async (office) => {
        if (office.id) {
          return await updateOffices(client, office, user);
        }
        return await createOffices(client, office, mainOffice, user);
      })
    );
    const respOffice = { ...mainOffice };
    respOffice.offices = offices;
    return respOffice;
  });
};
