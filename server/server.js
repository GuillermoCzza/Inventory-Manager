const express = require('express');
const app = express();
const cors = require('cors');

const config = require("./config.json");
const port = config.PORT || 3000;

const routes = require("./api.js");

const { Pool } = require('pg');
const { createdb } = require("pgtools");
const format = require('pg-format');

const pool = new Pool({
	user: config.DATABASE_USER,
	password: config.DATABASE_PASS,
	host: config.DATABASE_HOST,
	port: config.DATABASE_PORT,
	database: config.DATABASE_NAME,
	query_timeout: config.QUERY_TIMEOUT, //this is in miliseconds
	connectionTimeoutMillis: config.CONNECTION_TIMEOUT
});

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serving static files from the 'public' directory
app.use(express.static('public'));

//This middleware allows for CORS between the server and (any) client
app.use(cors({
	origin: '*'
}));

(async () => {
	try {
		//attempt to connect to database
		try {
			await pool.connect();
		} catch (e) {
			//if error code is 3D000 (i.e. database does not exist), create db, connect and create template_table
			if (e.code === '3D000') {
				console.log(`Database '${config.DATABASE_NAME}' not found. Attempting to create it...`);
				try {
					//create db
					const pgtoolsConfig = {
						user: config.DATABASE_USER,
						password: config.DATABASE_PASS
					}
					await createdb(pgtoolsConfig, config.DATABASE_NAME);

					//connect to db
					await pool.connect();

					//create template_table
					const queryColumnsString = config.TEMPLATE_TABLE_DATA_COLUMNS
						.map(column => `${format.ident(column)} TEXT`).join(", ");
					const query = `CREATE TABLE ${config.TEMPLATE_TABLE_NAME} (${config.IDENTIFIER_COLUMN} SERIAL PRIMARY KEY, ${queryColumnsString})`;
					await pool.query(query);
				} catch (e) {
					console.error(e);
					process.exit();
				}
			}
		}

		const SQLExampleResponse = await pool.query('SELECT $1::text as message', [`Connected to '${config.DATABASE_NAME}' database!`]);
		console.log(SQLExampleResponse.rows[0].message);

		routes(app, pool); //set up routes

		app.listen(port, () => console.log(`App listening on port ${port}!`));
	} catch (e) {
		console.error(e);
	}
})();