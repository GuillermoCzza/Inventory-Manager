# Inventory-Manager

This is a PostgreSQL table manager made for the purposes of providing a simple interface for managing inventory, though you can use it for whatever table you want by modifying the template_table table in the database.
Make sure you have PostgreSQL installed at whatever computer you want to host the database.

## Releases

To be added

## Usage

To use this application, you will have to fill out a config.json file in the server folder like this:

```json
{
 "PORT": 3000, //the port on which you want to host the app

 "DATABASE_HOST": "***.***.***.***", //the address of the PSQL server, can be global or local. To host the database on the same computer just write "localhost".
 "DATABASE_PORT": 5432, //the port where the PSQL server is hosted. Default is 5432
 "DATABASE_NAME": "inventory_db", //name of the database. Will be created if not found
 "DATABASE_USER": "", //PSQL username
 "DATABASE_PASS": "", //PSQL password 
 "QUERY_TIMEOUT": 10000, //time for datbase queries to time out
 "CONNECTION_TIMEOUT": 10000, //time for database connection attempts to time out

 "TEMPLATE_TABLE_NAME": "template_table", //name of the template table
 "TEMPLATE_TABLE_DATA_COLUMNS": ["nombre", "stock", "precio", "codigo"] //columns for the template table on creation. (DROP the template_table before changing this)
}
```

To run the app run start.bat in the server folder.

## Running from files

To get it to work from the files you will first have to run the console command 'npm run build' in the client folder.
