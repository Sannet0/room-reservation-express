const db = require('../modules/database.module');

const bookingRoom = async (req, res) => {
  try {
    const data = req.body;
    const checkinDate = new Date(data.checkin_date);
    const checkoutDate = new Date(data.checkout_date);

    if(checkinDate >= checkoutDate) {
      return res.status(400).send('check-in date cannot be greater or equal than check-out date');
    }

    if(checkinDate.getDay() === 1 || checkinDate.getDay() === 4 || checkoutDate.getDay() === 1 || checkoutDate.getDay() === 4) {
      return res.status(400).send('check-in and check-out date cannot be monday or thursday');
    }

    const daysDifference = Math.floor((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    data.checkin_date = `${ checkinDate.getFullYear() }-${ checkinDate.getMonth() + 1 }-${ checkinDate.getDate() }`;
    data.checkout_date = `${ checkoutDate.getFullYear() }-${ checkoutDate.getMonth() + 1 }-${ checkoutDate.getDate() }`;

    const roomsQuery = {
      text: 'SELECT * FROM rooms WHERE room_number = $1',
      values: [data.room_number],
    }
    const rooms = await db.query(roomsQuery);
    if(!rooms.rows.length) {
      return res.status(404).send('no such room');
    }

    const actualRoom = rooms.rows[0];
    const occupiedRoomsQuery = {
      text: 'SELECT booking_records.room_number FROM booking_records WHERE ( $1 < booking_records.checkout_date ) AND ( $2 > booking_records.checkin_date ) AND room_number = $3 LIMIT 1',
      values: [data.checkin_date, data.checkout_date, data.room_number],
    }
    const occupiedRooms = await db.query(occupiedRoomsQuery);

    if(occupiedRooms.rows.length) {
      return res.status(500).send('room occupied');
    }

    let totalPrice;

    if(daysDifference >= 10  && daysDifference < 20) {
      totalPrice = daysDifference * (actualRoom.price - (actualRoom.price * 0.1))
    } else if(daysDifference >= 20) {
      totalPrice = daysDifference * (actualRoom.price - (actualRoom.price * 0.2));
    } else {
      totalPrice = daysDifference * actualRoom.price;
    }

    const bookingRoomInsertQuery = {
      text: 'INSERT INTO booking_records ("room_number", "checkin_date", "checkout_date", "total_price") VALUES ($1, $2, $3, $4)',
      values: [data.room_number, data.checkin_date, data.checkout_date, totalPrice]
    }
    await db.query(bookingRoomInsertQuery);

    return res.status(201).send({ totalPrice });
  } catch (err) {
    return res.status(500).send({
      error: JSON.stringify(err)
    });
  }
}

const averageRoomsLoadReport = async (req, res) => {
  try {
    const data = req.query;
    const checkin_date = new Date(data.checkin_date);
    const checkout_date = new Date(data.checkout_date);

    data.checkin_date = `${ checkin_date.getFullYear() }-${ checkin_date.getMonth() + 1 }-${ checkin_date.getDate() }`;
    data.checkout_date = `${ checkout_date.getFullYear() }-${ checkout_date.getMonth() + 1 }-${ checkout_date.getDate() }`;

    const resultQuery = {
      text: 'SELECT ' +
        'to_char(booking_records.checkin_date, \'month\') AS record_month, ' +
        'booking_records.room_number, ' +
        'round(avg(abs(extract(day from booking_records.checkin_date::timestamp - booking_records.checkout_date::timestamp)))) AS average\n' +
        'FROM booking_records ' +
        'WHERE ($1 < booking_records.checkout_date) ' +
        'AND ($2 > booking_records.checkin_date) ' +
        'GROUP BY record_month, booking_records.room_number ' +
        'ORDER BY record_month, booking_records.room_number',
      values: [data.checkin_date, data.checkout_date]
    }
    const result = await db.query(resultQuery);

    return res.status(200).send(result.rows);
  } catch (err) {
    return res.status(500).send({
      error: JSON.stringify(err)
    });
  }
}

module.exports = {
  bookingRoom,
  averageRoomsLoadReport
}
