"use strict";

var _require = require("../expressError"),
    BadRequestError = _require.BadRequestError;
/**
 * Generates a SQL query snippet for updating specific fields in a database
 *
 * This function is useful for dynamically building `UPDATE` SQL queries
 * when you want to update only certain fields based on the input given by users
 *
 * @param {Object} dataToUpdate - An object where keys are the column names to update, and values are their new values
 * @param {Object} jsToSql - An object mapping JavaScript-style field names to database column names
 *
 * @returns {Object} An object containing:
 *  - `setCols`: a string of column-value pairs formatted for SQL
 *  - `values`: an array of the new values corresponding to the placeholders in `setCols`
 *
 * @throws {BadRequestError} If `dataToUpdate` is empty
 *
 * @examples
 *
 * const dataToUpdate = { firstName: "John", age: 30};
 * const jsToSQL = { firstName: "first_name", age: "age" }
 *
 * const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
 *
 * //result:
 * //{
 * //   setCols: "first_name"=$1, "age"=$2",
 * //   values: ["John", 30]
 * //}
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  var keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data"); // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']

  var cols = keys.map(function (colName, idx) {
    return "\"".concat(jsToSql[colName] || colName, "\"=$").concat(idx + 1);
  });
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate)
  };
}

module.exports = {
  sqlForPartialUpdate: sqlForPartialUpdate
};