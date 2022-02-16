const { Pool } = require('pg');

module.exports =  new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'room_reservation',
  password: 'postgres',
  port: 5432
});


