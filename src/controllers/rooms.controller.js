const db = require('../modules/database.module');

const nonOccupiedRooms = async (req, res) => {
  try {
    const data = req.query;
    const checkin_date = new Date(data.checkin_date);
    const checkout_date = new Date(data.checkout_date);

    data.checkin_date = `${ checkin_date.getFullYear() }-${ checkin_date.getMonth() + 1 }-${ checkin_date.getDate() }`;
    data.checkout_date = `${ checkout_date.getFullYear() }-${ checkout_date.getMonth() + 1 }-${ checkout_date.getDate() }`;

    const result = await db.query(`
      SELECT r.room_number FROM rooms
      JOIN(
        SELECT * FROM booking_records AS br 
        WHERE ('${ data.checkin_date }' < br.checkout_date)
        AND ('${ data.checkout_date }' > br.checkin_date)) AS br ON br.room_number = rooms.room_number
      RIGHT OUTER JOIN rooms AS r ON r.room_number = rooms.room_number 
      WHERE rooms.room_number is NULL
    `);

    res.send(result.rows);
  } catch (e) {
    res.send(e).status(502);
  }
}

module.exports = {
  nonOccupiedRooms,
}
