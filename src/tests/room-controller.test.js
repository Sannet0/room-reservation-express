const { nonOccupiedRooms } = require('../controllers/rooms.controller');
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.replace(/[^a-z0-9]/gi,'').replace(/\s+/gi,', ');
    if(replacedQuery === 'SELECTrroomnumberFROMroomsJOINSELECTFROMbookingrecordsASbrWHERE202241brcheckoutdateAND202251brcheckindateASbrONbrroomnumberroomsroomnumberRIGHTOUTERJOINroomsASrONrroomnumberroomsroomnumberWHEREroomsroomnumberisNULL')
    return {
      rows: [
        { "room_number": 19 }
      ]
    }
  }
}));

describe('nonOccupiedRooms', () => {
  test('POST /rooms', async () => {
    const req = {
      query: {
        checkin_date: "2022-04-01",
        checkout_date: "2022-05-01"
      }
    };
    const res = {
      text: '',
      send: (input) => {
        res.text = input
      }
    };

    await nonOccupiedRooms(req, res);

    expect(res.text).toEqual([
      { "room_number": 19 }
    ]);
  });
})
