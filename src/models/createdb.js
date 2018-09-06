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
				createdon TIMESTAMP
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

async function create_tables() {
	tables.forEach(async (t) => {
		await pool.query(t.query)
	})
}

create_tables();
pool.end();
