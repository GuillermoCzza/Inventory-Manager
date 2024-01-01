const express = require('express');
const app = express();
const cors = require('cors');

const config = require("./config.json");
const port = config.PORT || 3000;

const routes = require("./api.js");

const { Pool } = require('pg');
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
		await pool.connect();
		process.on('exit', () => {
			pool.end();
		});

		const SQLExampleResponse = await pool.query('SELECT $1::text as message', ['Connected to Database!']);
		console.log(SQLExampleResponse.rows[0].message);

		routes(app, pool); //set up routes

	} catch (err) {
		console.error(err);
		process.exit();
	}
})();

app.listen(port, () => console.log(`App listening on port ${port}!`));