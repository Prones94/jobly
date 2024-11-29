"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl",
                  json_agg(json_build_object('id', j.id,
                                             'title', j.title,
                                             'salary', j.salary,
                                             'equity', j.equity)) AS jobs
           FROM companies c
           LEFT JOIN jobs j on c.handle = j.company_handle
           WHERE handle = $1
           GROUP BY c.handle`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies
                      SET ${setCols}
                      WHERE handle = ${handleVarIdx}
                      RETURNING handle,
                                name,
                                description,
                                num_employees AS "numEmployees",
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }

  /**
   * Find companies with optional filtering criteria
   *
   * @param {Object} filters - Optional filtering criteria
   *  - {string} name: Part of the company name (case-insensitive)
   *  - {number} minEmployees: Minimum number of employees
   *  - {number} maxEmployees: Maximum number of employees
   *
   * @throws {BadRequestError} If minEmployees > maxEmployees
   *
   * @returns {Array} Array of company objects
   */
  static async findFiltered(filters = {}){
    const { name, minEmployees, maxEmployees } = filters

    if (minEmployees !== undefined && maxEmployees !== undefined && minEmployees > maxEmployees){
      throw new BadRequestError("minEmployees cannot be greater than maxEmployees")
    }

    let whereClauses = []
    let queryParams = []

    if (name){
      queryParams.push(`%${name}%`)
      whereClauses.push(`name ILIKE $${queryParams.length}`)
    }

    if (minEmployees !== undefined){
      queryParams.push(minEmployees)
      whereClauses.push(`num_employees >= $${queryParams.length}`)
    }

    if (maxEmployees !== undefined){
      queryParams.push(maxEmployees)
      whereClauses.push(`num_employees <= $${queryParams.length}`)
    }

    const whereClause = whereClauses.length > 0 ? "WHERE" + whereClauses.join(" AND ") : ""

    const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
      FROM companies
      ${whereClause}
      ORDER BY name`,
      queryParams
    )

    return companiesRes.rows
  }
}


module.exports = Company;
