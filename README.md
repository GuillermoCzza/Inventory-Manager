# Inventory-Manager

This is a PostgreSQL table manager made for the purposes of providing a simple interface for managing inventory, though you can use it for whatever table you want by modifying the template_table table in the database.

You must have [Node.js](https://nodejs.org/en) installed to run this. Also, make sure you have [PostgreSQL](https://www.postgresql.org/) installed at whatever computer you want to host the database.

## Releases

To be added

## Usage

To use this application, you will have to fill out a config.json file in the server folder like this (without the comments):

```json
{
 "PORT": 3000, //the port on which you want to host the app

 "DATABASE_HOST": "***.***.***.***", //the address of the PSQL server, can be global or local.
 //To host the database on the same computer just write "localhost".
 "DATABASE_PORT": 5432, //the port where the PSQL server is hosted. Default is 5432
 "DATABASE_NAME": "inventory_db", //name of the database. Will be created if not found
 "DATABASE_USER": "", //PSQL username
 "DATABASE_PASS": "", //PSQL password 
 "QUERY_TIMEOUT": 10000, //time for datbase queries to time out
 "CONNECTION_TIMEOUT": 10000, //time for database connection attempts to time out

 "TEMPLATE_TABLE_NAME": "template_table", //name of the template table
 "TEMPLATE_TABLE_DATA_COLUMNS": ["nombre", "stock", "precio", "codigo"] //columns for the
//template table on creation. (DROP the template_table before changing this)
}
```

To start the app run start.bat in the server folder. Once this is done, you can access the application by entering "«host address»:«port»" (without quotation marks) in the URL bar of your preferred browser.

**Note**: renaming the primary key column of the template table, or any other table in the database is not adviced. If for whatever reason you must do so, you have to download the source code, rename the IDENTIFIER_COLUMN field at client/src/clientConfig.json to match the new name, run npm build in the client folder, and restart the application.

## Running from files

To get it to work from the files you will first have to run the console command 'npm run build' in the client folder.
