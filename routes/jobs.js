"use strict"

const jsonschema = require("jsonschema")
const express = require("express")
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth")
const Job = require("../models/job")
const jobNewSchema = require("../schemas/jobNew.json")
const jobUpdateSchema = require("../schemas/jobUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const { BadRequestError } = require("../expressError")

const router = express.Router()

/** POST / {job} => { job }
 * job should be { title, salary, equity, companyHandle }
 * Returns { id, title, salary, equity, companyHandle }
 * Authorization required: admin
*/
router.post("/", ensureLoggedIn, ensureAdmin, async function(req,res,next){
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema)
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }

    const job = await Job.create(req.body)
    return res.status(201).json({ job })
  } catch (err) {
    return next(err)
  }
})

/** GET / => { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 * Can filter on provided search filters:
 * - title (case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
*/
router.get("/", async function (req,res,next){
  try {
    const query = req.query

    // Convert numeric and boolean qury parameters
    if (query.minSalary !== undefined) query.minSalary = +query.minSalary
    if (query.hasEquity !== undefined) query.hasEquity = query.hasEquity === "true"

    // Validate query parameters
    const validator = jsonschema.validate(query, jobSearchSchema)
    if (!validator.valid){
      const errors = validator.errors.map(e => e.stack)
      throw new BadRequestError(errors)
    }
    
    const jobs = await Job.findAll()
    return res.json({ jobs })
  } catch (err) {
    return next(err)
  }
})

/** GET /[id] => { job }
 * Returns { id, title, salary, equity, companyHandle }
 * Authorization required: none
*/
router.get("/:id", async function (req,res,next){
  try {
    const job = await Job.get(req.params.id)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

/** PATCH /[id] { fld1, fld2, ...} => { job }
 * Patches job data
 * fields can be: { title, salary, equity }
 * returns { id, title, salary, equity, companyHandle }
 * Authorization required: admin
*/
router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req,res, next){
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema)
    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }
    const job = await Job.update(req.params.id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

/** DELETE .[id] => { deletedL id}
 * Authorization required: admin
*/
router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req,res, next){
  try {
    await Job.remove(req.params.id)
    return res.json({ deleted: req.params.id })
  } catch (err) {
    return next(err)
  }
})

module.exports = router