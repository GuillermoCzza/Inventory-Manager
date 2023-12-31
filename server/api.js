const format = require('pg-format');
const config = require("./config.json");
const { IDENTIFIER_COLUMN } = require("../client/src/clientConfig.json")
const { tableNameToLowerCase, protectTemplate } = require('./middleware.js');

/**
* @param {import('express').Express} app
* @param {import('pg').Pool} pool
**/
module.exports = (app, pool) => {
	//get all tables in the database
	app.get('/tables', async (req, res) => {
		try {
			const tableList = await getTableList();
			res.json(tableList)
		} catch (err) {
			res.json({ error: err });
			console.error(err);
			console.log('error al GET todas las tablas');
		}
	});

	//create a new table
	app.post('/tables', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableString = req.body.tableName.trim().replaceAll(/\s+/gi, '_');
			const tableName = encodeURIComponent(tableString).toLowerCase(); //this is necessary because pg doesn't do safe identifier insertion (though it does do other query parameters safely)
			const escapedIdentifier = format.ident(tableName);
			//tables are created from template table to have the same column types
			await pool.query(`CREATE TABLE ${escapedIdentifier} (LIKE ${config.TEMPLATE_TABLE_NAME} INCLUDING ALL)`);
			
			const tableList = await getTableList();
			res.json(tableList)
		} catch (err) {
			console.log('error al POST una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});


	//TODO: delete table (except template table). Falta testear
	app.delete('/tables', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.body.tableName;
			await pool.query(`DROP TABLE "${tableName}"`);

			const tableList = await getTableList();
			res.json(tableList)
		} catch (err) {
			console.log('error al DELETE una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//Get a specific table
	app.get('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		const tableName = req.params.tableName;
		try {
			const tabla = await getTable(tableName, req.query);
			res.json(tabla);
		} catch (err) {
			console.log('error al GET una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});


	//Creates a new, empty row
	app.post('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		const tableName = req.params.tableName;
		try {
			await pool.query(`INSERT INTO ${tableName} DEFAULT VALUES`);
			const tabla = await getTable(tableName, req.query);
			res.json(tabla);
		} catch (err) {
			console.log('error al POST una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//TODO: modify row (the more generic the implementation, the better)
	app.put('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.params.tableName;
			const keyValuePairs = req.body.keyValuePairs; //is an array of {key, value} objects

			//find name of identifier
			let identifier = null;
			for (const pair of keyValuePairs) {
				if (pair.key == IDENTIFIER_COLUMN) {
					identifier = pair.value;
					break;
				}
			}
			if (identifier == null) {
				res.json({ error: "Identifier column not found." })
				return;
			}

			//write the string for the query values
			let queryAssignmentsString = "";
			const valuesArray = [];

			let valueIndexInArr = '0';
			for (const pair of keyValuePairs) {
				//skip identifier column, for it cannot be reassigned
				if (pair.key == IDENTIFIER_COLUMN) {
					valueIndexInArr++;
					continue;
				}

				//write down each key and value in order
				queryAssignmentsString += `${pair.key} = $${valueIndexInArr}`;

				//if it's not the last one, add a comma to the set query string
				if (valueIndexInArr != keyValuePairs.length - 1) {
					queryAssignmentsString += ", ";
				}
				valuesArray.push(pair.value);

				valueIndexInArr++;
			}

			//perform the row updating
			const query = `UPDATE ${tableName} SET ${queryAssignmentsString} WHERE ${IDENTIFIER_COLUMN}='${identifier}'`
			await pool.query(query, valuesArray);

			//send back the updated table
			const tabla = await getTable(tableName, req.query);
			res.json(tabla);
		} catch (err) {
			console.log('error al PUT (modificar) una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//TODO: delete row
	app.delete('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.params.tableName;
			const id = req.body.row[IDENTIFIER_COLUMN]; //row is the node-pg sql row object (json)

			//perform the row deletion
			await pool.query(`DELETE FROM ${tableName} WHERE ${IDENTIFIER_COLUMN}=$1`, [id]);

			//send back the updated table
			const tabla = await getTable(tableName, req.query);
			res.json(tabla);
		} catch (err) {
			console.log('error al DELETE una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	})

	async function getTable(tableName, query) {
		const ascending = query.sortAscending;
		const sortField = query.sortField;
		let sqlQuery = `SELECT * FROM ${tableName}`

		if (sortField) { //if sortfield isn't falsy
			sqlQuery += ` ORDER BY ${sortField}`;

			if (ascending === 'true') {
				sqlQuery += ' ASC';
			} else {
				sqlQuery += ' DESC';
			}
		}


		const tabla = await pool.query(sqlQuery);
		return tabla;
	}

	async function getTableList(){
		const tablas = await pool.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
			//remove template table from results
			for (const index in tablas.rows) {
				if (tablas.rows[index].table_name == config.TEMPLATE_TABLE_NAME) {
					tablas.rows.splice(index, 1);
					break;
				}
			}

			return tablas;
	}
};