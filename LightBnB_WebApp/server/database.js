const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

const userEmailQueryString = `
  SELECT *
  FROM users
  WHERE email = $1
`;

const getUserWithEmail = (email) => {
  return pool
    .query(userEmailQueryString, [email])
    .then(result => {
      if (result.rows) {
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

const userIdQueryString = `
  SELECT *
  FROM users
  WHERE id = $1
`;

const getUserWithId = (id) => {
  return pool
    .query(userIdQueryString, [id])
    .then(result => {
      if (result.rows) {
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

const addUserQueryString = `
  INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *
`;
const addUser = (users) => {

  return pool
    .query(addUserQueryString, [users.name, users.email, users.password])
    .then(result => result.rows);
};
exports.addUser = addUser;



/// Reservations

const reservationsQueryString = `
SELECT properties.*, reservations.*
FROM reservations
JOIN properties ON reservations.property_id = properties.id
WHERE reservations.guest_id = $1
AND reservations.end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT $2
`;

const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query(reservationsQueryString, [guest_id, limit])
    .then(result => result.rows)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

const getAllProperties = (options, limit = 10) => {

  const queryParams = [];
  let queryString = `
        SELECT properties.*, avg(property_reviews.rating) as average_rating
        FROM properties
        JOIN property_reviews ON properties.id = property_id
        `;
 
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
 
  if (options.owner_id) {
    queryString += queryParams.length === 0 ? `WHERE ` : `AND `;
    queryParams.push(`%${options.owner_id}%`);
    queryString += `properties.owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryString += queryParams.length === 0 ? `WHERE ` : `AND `;
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `properties.cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryString += queryParams.length === 0 ? `WHERE ` : `AND `;
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `properties.cost_per_night <= $${queryParams.length} `;
  }

  queryString += `
  GROUP BY properties.id 
  `;

  if (options.minimum_rating) {
    queryParams.push(parseInt(options.minimum_rating));
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  }
 
  queryParams.push(limit);
  queryString += ` 
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;
   
  return pool.query(queryString, queryParams).then((res) => res.rows).catch((err) => err.message);

};
exports.getAllProperties = getAllProperties;


const addPropertyQueryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
`;
const addProperty = (properties) => {

  return pool
    .query(addPropertyQueryString, [properties.owner_id, properties.title, properties.description, properties.thumbnail_photo_url, properties.cover_photo_url, properties. cost_per_night, properties.street, properties.city, properties.province, properties.post_code, properties.country, properties.parking_spaces, properties.number_of_bathrooms, properties.number_of_bedrooms])
    .then(result => result.rows);
};
exports.addProperty = addProperty;
