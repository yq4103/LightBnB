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

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

const propertiesQueryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  GROUP BY properties.id
  LIMIT $1
`;

const getAllProperties = (options, limit = 10) => {
  return pool
    .query(propertiesQueryString, [limit])
    .then(result => result.rows)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
