const { nonOccupiedRooms } = require('../controllers/rooms.controller');
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.text.replace(/\s+/gi,'');
    const stringValues = query.values.toString();

    if(replacedQuery === 'SELECTr.room_numberFROMroomsJOIN(SELECT*FROMbooking_recordsASbrWHERE($1<br.checkout_date)AND($2>br.checkin_date))ASbrONbr.room_number=rooms.room_numberRIGHTOUTERJOINroomsASrONr.room_number=rooms.room_numberWHERErooms.room_numberisNULL') {
      if(stringValues === '2022-4-1,2022-5-1') {
        return { rows: [{ "room_number": 19 }] }
      }
    }
  }
}));

const res = {
  text: '',
  statusCode: 200,
  status: (status) => {
    res.statusCode = status;
    return {
      send: (input) => {
        res.text = input;
      }
    }
  }
};

describe('nonOccupiedRooms', () => {
  test('POST /rooms', async () => {
    const req = {
      query: {
        checkin_date: "2022-04-01",
        checkout_date: "2022-05-01"
      }
    };

    res.text = '';
    res.statusCode = 200;

    await nonOccupiedRooms(req, res);

    expect(res.text).toEqual([
      { "room_number": 19 }
    ]);
  });
})
