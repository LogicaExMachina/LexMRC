const { Pool, Client } = require('pg')

const pool = new Pool({
	host: 'localhost',
	user:	'LexMRC',
	database: 'LexMRC',
	port: 5432
})

const tables = [
	{
		name: 'users',
		query: `
			CREATE TABLE IF NOT EXISTS users
			(
				id SERIAL PRIMARY KEY,
				username VARCHAR(200) NOT NULL UNIQUE,
				lastname VARCHAR(200),
				firstname VARCHAR(200),
				created_on TIMESTAMP
			);
		`
	},{
		name: 'authentications',
		query: `
			CREATE TABLE IF NOT EXISTS authentications
			(
				id	SERIAL PRIMARY KEY,
				user_id INTEGER NOT NULL REFERENCES users (id),
				password VARCHAR(60) NOT NULL,
				last_changed TIMESTAMP,
				change_on_login BOOLEAN
			);
		`
	}
]

const functions = [
	{
		name: 'p_user',
		query: `
			CREATE OR REPLACE FUNCTION p_user
				(username_in VARCHAR(200),
				 lastname_in VARCHAR(200),
				 firstname_in VARCHAR(200))
			RETURNS Boolean
			AS
			$$
			BEGIN
				IF EXISTS (
					SELECT 1
					FROM users u
					WHERE u.username = username_in
				)
				THEN
					RETURN FALSE;
				END IF;

				INSERT INTO users
				(
					username,
					lastname,
					firstname,
					created_on
				)
				SELECT username_in,
							 lastname_in,
							 firstname_in,
							 CURRENT_TIMESTAMP;

				RETURN TRUE;
			END
			$$ LANGUAGE 'plpgsql';
		`
	},
	{
		name: 'p_userPassword',
		query: `
			CREATE OR REPLACE FUNCTION  p_userPassword
				 (userid INTEGER,
					hash VARCHAR(60))
			RETURNS Boolean
			AS
			$$
			BEGIN
				IF NOT EXISTS (
					SELECT 1
					FROM users u
					WHERE u.id = userid
				)
				THEN
					RETURN FALSE;
				END IF;

				INSERT INTO authentications
				(
					user_id,
					password,
					last_changed,
					change_on_login
				)
				SELECT	userid,
								hash,
								CURRENT_TIMESTAMP,
								FALSE
				ON CONFLICT (user_id) DO
				UPDATE
					SET hash = EXCLUDED.hash,
							last_change = CURRENT_TIMESTAMP,
							change_on_login = FALSE;
				RETURN TRUE;
			END
			$$ LANGUAGE 'plpgsql';
		`
	}
]

async function create_tables() {
	tables.forEach(async (t) => {
		await pool.query(t.query)
	})
}

async function create_functions() {
	functions.forEach(async (f) => {
		await pool.query(f.query);
	})
}

create_tables();
create_functions();
pool.end();
