\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

\i jobly-schema.sql
\i jobly-seed.sql

\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

\i jobly-schema.sql


-- Define the ENUM type for application states
CREATE TYPE application_state AS ENUM ('interested', 'applied', 'accepted', 'rejected')

-- Create the applications table with the ENUM type
CREATE TABLE applications (
  username VARCHAR(25) NOT NULL REFERENCES users ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs ON DELETE CASCADE,
  state application_state NOT NULL DEFAULT 'interested',
  PRIMARY KEY (username, job_id)
)