"use strict"

const db = require("../db")
const { BadRequest, NotFoundError } = require("../expressError")
const sqlForPartialUpdate = require("../helpers/sql")

/** Related functions for jobs */

class Job {
  /** Create a job (from data), update db, return new job data
   * data should be { title, salary, equity, companyHandle }
   * REturns { id, title, salary, equity, companyHandl }
  */
 static async create({ title, salary, equity, companyHandle }) {
   const result = await db.query(
     `INSERT INTO jobs
     (title, salary, equity, company_handle)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
     [title, salary, equity, companyHandle]
   )
   const job = result.rows[0]

   return job
 }

 /** Find all jobs
  * REturns [{ id, title, salary, companyHandle }, ...]
  */
 static async findAll() {
   const jobsRes = await db.query(
     `SELECT id,
             title,
             salary,
             equity,
             company_handle AS "companyHandle"
      FROM jobs
      ORDER BY title`
   )
   return jobsRes.rows
 }

 /** Given a job ID, return data about the job
  * Returns { id, title, salary, equity, companyHandle }
  * Throws NotFoundError if not found
 */
static async get(id) {
  const jobRes = await db.query(
    `SELECT id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
    FROM jobs
    WHERE id = $1`,
    [id]
  )

  const job = jobRes.rows[0]

  if (!job) throw new NotFoundError(`No job with ID: ${id}`)

  return job
}

/** Update job data with `data`
 * This is a "partial update" --- it's fine if data doesn't contain all the fields; this only changes provided fields
 * Data include: { title, salary, equity }
 * returns { id, title, salary, equity, companyHandle }
 * Throws  NotFoundError if not found
*/
static async update(id, data){
  const { setCols, values } = sqlForPartialUpdate(data, {
    title: "title",
    salary: "salary",
    equity: "equity",
  })
  const idVarIdx = "$" + (values.length + 1)

  const querySQL = `UPDATE jobs
                    SET ${setCols}
                    WHERE id = ${idVarIdx}
                    RETURNING id,
                              title,
                              salary,
                              equity,
                              company_handle AS "companyHandle"`
  const result = await db.query(querySql, [...values, id])
  const job = result.rows[0]

  if (!job) throw new NotFoundError(`No job with ID: ${id}`)

  return job
}

/** Delete given job from database; returns undefined
 *
 * Throws NotFoundError if job not found
 */
static async remove(id) {
  const result = await db.query(
    `DELETE
     FROM jobs
     WHERE id = $1
     RETURNING id`,
     [id]
  );
  const job = result.rows[0];

  if (!job) throw new NotFoundError(`No job with ID: ${id}`)
}
}

module.exports = Job