const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function() {

  test("works: valid input with field mappings", function () {
    const dataToUpdate = { firstName: "John", age: 30 };
    const jsToSql = { firstName: "first_name", age: "age"};

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["John", 30]
    });
  });

  test("works: valid input without field mappings", function(){
    const dataToUpdate = { firstName: "John", age: 30 };
    const jsToSQL = {};

    const result = sqlForPartialUpdate(dataToUpdate, jsToSQL);

    expect(result).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ["John", 30] // Corrected case sensitivity
    });
  });

  test("throws error if no data provided", function (){
    expect(() => sqlForPartialUpdate({}, {})).toThrow(BadRequestError);
  });

  test("works: input with additional fields not in mapping", function() {
    const dataToUpdate = { firstName: "John", lastName: "Doe", age: 30 };
    const jsToSql = { firstName: "first_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "lastName"=$2, "age"=$3',
      values: ["John", "Doe", 30]
    });
  });

  test("works: single field update", function() {
    const dataToUpdate = { age: 30 };
    const jsToSql = { age: "user_age" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"user_age"=$1',
      values: [30]
    });
  });
});
