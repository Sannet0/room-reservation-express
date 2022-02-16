const db = require('../modules/database.module');

const bookingRoom = async (req, res) => {
  try {
    const body = req.body;
    const checkin_date = new Date(body.checkin_date);
    const checkout_date = new Date(body.checkout_date);

    if(checkin_date >= checkout_date) {
      res.send('check-in date cannot be greater or equal than check-out date').status(502);
      return;
    }

    if(checkin_date.getDay() === 1 || checkin_date.getDay() === 4 || checkout_date.getDay() === 1 || checkout_date.getDay() === 4) {
      res.send('check-in and check-out date cannot be monday or thursday').status(502);
      return;
    }

    body.checkin_date = `${ checkin_date.getFullYear() }-${ checkin_date.getMonth() + 1 }-${ checkin_date.getDate() }`;
    body.checkout_date = `${ checkout_date.getFullYear() }-${ checkout_date.getMonth() + 1 }-${ checkout_date.getDate() }`;

    const rooms = await db.query(`
        SELECT * FROM rooms WHERE room_number = '${ body.room_number }'
    `);

    if(rooms.rows.length === 0) {
      res.send('no such room').status(404);
      return;
    }

    const actualRoom = rooms.rows[0];

    const occupiedRooms = await db.query(`
        SELECT booking_records.room_number FROM booking_records 
        WHERE ('${ body.checkin_date }' < booking_records.checkout_date)
        AND ('${ body.checkout_date }' > booking_records.checkin_date)
        AND room_number = '${ body.room_number }'
        LIMIT 1
    `);

    if(occupiedRooms.rows.length !== 0) {
      res.send('room occupied').status(502);
      return;
    }

    let totalPrice = actualRoom.price;

    if(actualRoom.price >= 10) {
      totalPrice = actualRoom.price / 100 * 10;
    } else if(actualRoom.price >= 20) {
      totalPrice = actualRoom.price / 100 * 20;
    }

    await db.query(`
        INSERT INTO booking_records ("room_number", "checkin_date", "checkout_date", "total_price") 
        VALUES ('${ body.room_number }', 
        '${ body.checkin_date }', 
        '${ body.checkout_date }',
        '${ totalPrice }')`
    );

    res.send('room reserved successfully').status(201);
  } catch (e) {
    res.send(e).status(502);
  }
}

const averageRoomsLoadReport = async (req, res) => {
  try {
    const data = req.query;
    const checkin_date = new Date(data.checkin_date);
    const checkout_date = new Date(data.checkout_date);

    data.checkin_date = `${ checkin_date.getFullYear() }-${ checkin_date.getMonth() + 1 }-${ checkin_date.getDate() }`;
    data.checkout_date = `${ checkout_date.getFullYear() }-${ checkout_date.getMonth() + 1 }-${ checkout_date.getDate() }`;

    const result = await db.query(`
      SELECT
      to_char(booking_records.checkin_date, 'month') AS record_month,
      booking_records.room_number,
      round(avg(abs(extract(day from booking_records.checkin_date::timestamp - booking_records.checkout_date::timestamp)))) AS average
      FROM booking_records
      WHERE ('${ data.checkin_date }' < booking_records.checkout_date)
      AND ('${ data.checkout_date }' > booking_records.checkin_date)
      GROUP BY record_month, booking_records.room_number
      ORDER BY record_month, booking_records.room_number
    `);

    res.send(result.rows);
  } catch (e) {
    res.send(e).status(502);
  }
}

module.exports = {
  bookingRoom,
  averageRoomsLoadReport
}
