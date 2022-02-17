const { bookingRoom, averageRoomsLoadReport } = require('../controllers/booking-records.controller');
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.text.replace(/\s+/gi,'');
    const stringValues = query.values.toString();

    if(replacedQuery === 'SELECTto_char(booking_records.checkin_date,\'month\')ASrecord_month,booking_records.room_number,round(avg(abs(extract(dayfrombooking_records.checkin_date::timestamp-booking_records.checkout_date::timestamp))))ASaverageFROMbooking_recordsWHERE($1<booking_records.checkout_date)AND($2>booking_records.checkin_date)GROUPBYrecord_month,booking_records.room_numberORDERBYrecord_month,booking_records.room_number') {
      if(stringValues === '2022-4-3,2022-5-1') {
        return {
          rows: [
            { record_month: "april    ", room_number: 2, average: "6" },
            { record_month: "april    ", room_number: 3, average: "6" }
          ]
        };
      }
    }
    if(replacedQuery === 'SELECT*FROMroomsWHEREroom_number=$1') {
      if(stringValues === '1') {
        return { rows: [] };
      }
      if(stringValues === '19') {
        return { rows: [{ room_number: 19, price: 1000 }] };
      }
    }
    if(replacedQuery === 'SELECTbooking_records.room_numberFROMbooking_recordsWHERE($1<booking_records.checkout_date)AND($2>booking_records.checkin_date)ANDroom_number=$3LIMIT1') {
      if(stringValues === '2022-9-2,2022-9-9,19') {
        return { rows: [{ room_number: 19 }] }
      }
      if(stringValues === '2022-4-3,2022-5-1,19') {
        return { rows: [] }
      }
    }
    if(replacedQuery === 'INSERTINTObooking_records("room_number","checkin_date","checkout_date","total_price")VALUES($1,$2,$3,$4)') {
      if(stringValues === '19,2022-4-3,2022-5-1,') {
        return { rows: [] }
      }
    }
  }}));

const res = {
  text: '',
  status: 200,
  send: (input) => {
    res.text = input;

    return {
      status: (status) => {
        res.status = status;
      }
    }
  }
};

describe('bookingRoom', () => {
  it('should return an http exception with status code 201', async () => {
    const req = {
      body: {
        room_number: 19,
        checkin_date: "2022-04-03",
        checkout_date: "2022-05-01"
      }
    };

    res.text = '';
    res.status = 200;

    await bookingRoom(req, res);

    expect(res.text).toEqual('room reserved successfully');
    expect(res.status).toEqual(201);
  })
  it('should return an http exception with status code 502 and message "check-in date cannot be greater or equal than check-out date"', async () => {
    const req = {
      body: {
        room_number: 19,
        checkin_date: "2022-05-01",
        checkout_date: "2022-04-03"
      }
    };

    res.text = '';
    res.status = 200;

    await bookingRoom(req, res);

    expect(res.text).toEqual('check-in date cannot be greater or equal than check-out date');
    expect(res.status).toEqual(400);
  })
  it('should return an http exception with status code 502 and message "check-in and check-out date cannot be monday or thursday"', async () => {
    const req = {
      body: {
        room_number: 19,
        checkin_date: "2022-02-15",
        checkout_date: "2022-02-17"
      }
    };

    res.text = '';
    res.status = 200;

    await bookingRoom(req, res);

    expect(res.text).toEqual('check-in and check-out date cannot be monday or thursday');
    expect(res.status).toEqual(400);
  })
  it('should return an http exception with status code 404 and message "no such room"', async () => {
    const req = {
      body: {
        room_number: 1,
        checkin_date: "2022-04-03",
        checkout_date: "2022-05-01"
      }
    };

    res.text = '';
    res.status = 200;

    await bookingRoom(req, res);

    expect(res.text).toEqual('no such room');
    expect(res.status).toEqual(404);
  })
  it('should return an http exception with status code 404 and message "room occupied"', async () => {
    const req = {
      body: {
        room_number: 19,
        checkin_date: "2022-09-02",
        checkout_date: "2022-09-09"
      }
    };

    res.text = '';
    res.status = 200;

    await bookingRoom(req, res);

    expect(res.text).toEqual('room occupied');
    expect(res.status).toEqual(500);
  })
});

describe('averageRoomsLoadReport',  () => {

  test('should return an array of average rooms load group by month', async () => {
    const req = {
      query: {
        checkin_date: "2022-04-03",
        checkout_date: "2022-05-01"
      }
    };

    res.text = '';
    res.status = 200;

    await averageRoomsLoadReport(req, res);

    expect(res.text).toEqual([
      {
        record_month: "april    ",
        room_number: 2,
        average: "6"
      },
      {
        record_month: "april    ",
        room_number: 3,
        average: "6"
      }
    ]);
  })
})
