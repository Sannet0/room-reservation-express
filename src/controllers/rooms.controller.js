const db = require('../modules/database.module');

const nonOccupiedRooms = async (req, res) => {
  try {
    const data = req.query;
    const checkinDate = new Date(data.checkin_date);
    const checkoutDate = new Date(data.checkout_date);

    data.checkin_date = `${ checkinDate.getFullYear() }-${ checkinDate.getMonth() + 1 }-${ checkinDate.getDate() }`;
    data.checkout_date = `${ checkoutDate.getFullYear() }-${ checkoutDate.getMonth() + 1 }-${ checkoutDate.getDate() }`;

    const resultQuery = {
      text: 'SELECT r.room_number FROM rooms ' +
        'JOIN( ' +
        'SELECT * FROM booking_records AS br ' +
        'WHERE ($1 < br.checkout_date) ' +
        'AND ($2 > br.checkin_date)) AS br ON br.room_number = rooms.room_number ' +
        'RIGHT OUTER JOIN rooms AS r ON r.room_number = rooms.room_number ' +
        'WHERE rooms.room_number is NULL',
      values: [data.checkin_date, data.checkout_date],
    }
    const result = await db.query(resultQuery);

    res.send(result.rows);
  } catch (e) {
    res.send(e).status(500);
  }
}

module.exports = {
  nonOccupiedRooms,
}
