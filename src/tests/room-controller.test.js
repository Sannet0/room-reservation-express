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

describe('nonOccupiedRooms', () => {
  test('POST /rooms', async () => {
    const req = {
      query: {
        checkin_date: "2022-04-01",
        checkout_date: "2022-05-01"
      }
    };

    res.text = '';
    res.status = 200;

    await nonOccupiedRooms(req, res);

    expect(res.text).toEqual([
      { "room_number": 19 }
    ]);
  });
})
