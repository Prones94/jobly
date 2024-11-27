"use strict";

var _require = require("./sql"),
    sqlForPartialUpdate = _require.sqlForPartialUpdate;

var _require2 = require("../expressError"),
    BadRequestError = _require2.BadRequestError;

describe("sqlForPartialUpdate", function () {
  test("works: valid input with field mappings", function () {
    var dataToUpdate = {
      firstName: "John",
      age: 30
    };
  });
});