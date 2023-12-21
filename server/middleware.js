const config = require('./config.json');

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 */
module.exports = {
	/**
	* @param {ExpressRequest} req
	**/
	//Custom middleware to make it so tableName is always lowercase
	tableNameToLowerCase: (req, _res, next) => {
		//if exist, turn req.body.tableName and/or req.params.tableName to lowercase
		if (req.body.tableName) {
			req.body.tableName = req.body.tableName.toLowerCase();
		}
		if (req.params.tableName) {
			req.params.tableName = req.params.tableName.toLowerCase();
		}
		next();
	},


	/**
	* @param {import('express').Request} req
	* @param {import('express').Response} res
	**/
	//Custom middleware to prevent targeting the template table in body or params
	protectTemplate: (req, res, next) => {
		if (req.body.tableName == config.TEMPLATE_TABLE_NAME || req.params.tableName == config.TEMPLATE_TABLE_NAME) {
			res.status(403).json({ error: 'Accessing the template table is forbidden' });
		} else {
			next();
		}
	}


};