const { bookingRoom, averageRoomsLoadReport } = require('../controllers/booking-records.controller');
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.replace(/[^a-z0-9]/gi,'').replace(/\s+/gi,', ');
    if(replacedQuery === 'SELECTFROMroomsWHEREroomnumber19') {
      return {
        rows: [
          {
            room_number: 19,
            price: 1000
          }
        ]
      }
    }
    if(replacedQuery === 'SELECTFROMroomsWHEREroomnumber1') {
      return {
        rows: []
      }
    }
    if(replacedQuery === 'SELECTbookingrecordsroomnumberFROMbookingrecordsWHERE202141bookingrecordscheckoutdateAND202151bookingrecordscheckindateANDroomnumber1LIMIT1') {
      return {
        rows: []
      }
    }
    if(replacedQuery === 'SELECTbookingrecordsroomnumberFROMbookingrecordsWHERE202292bookingrecordscheckoutdateAND202299bookingrecordscheckindateANDroomnumber19LIMIT1') {
      return {
        rows: [
          {
            room_number: 19
          }
        ]
      }
    }
    if(replacedQuery === 'INSERTINTObookingrecordsroomnumbercheckindatecheckoutdateVALUES19202243202251') {
      return {
        rows: []
      }
    }
    if(replacedQuery === 'SELECTbookingrecordsroomnumberFROMbookingrecordsWHERE202243bookingrecordscheckoutdateAND202251bookingrecordscheckindateANDroomnumber19LIMIT1') {
      return {
        rows: []
      }
    }
    if(replacedQuery === 'SELECTtocharbookingrecordscheckindatemonthASrecordmonthbookingrecordsroomnumberroundavgabsextractdayfrombookingrecordscheckindatetimestampbookingrecordscheckoutdatetimestampASaverageFROMbookingrecordsWHERE202243bookingrecordscheckoutdateAND202251bookingrecordscheckindateGROUPBYrecordmonthbookingrecordsroomnumberORDERBYrecordmonthbookingrecordsroomnumber') {
      return {
        rows: [
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
        ]
      }
    }
  }
}));

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
    expect(res.status).toEqual(502);
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
    expect(res.status).toEqual(502);
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
    expect(res.status).toEqual(502);
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
