import config from './clientConfig.json';

export default function Tabla(tabla) {
	const columnOrder = []; //necessary to write values of rows in same order
	const filas = []; //this will contain the JSX of all the rows

	//create table headers and record column order for the fields
	const headersJSX = []
	tabla.fields.forEach(field => {
		const fieldName = field.name.toUpperCase();
		headersJSX.push(<div key={`${tabla.tableName}-${field.name}-header`} className='table-cell'><p>{fieldName}</p></div>)
		columnOrder.push(field.name);
	});
	filas.push(<div key={`${tabla.tableName}-headers-row`} className='table-row table-headers'>{headersJSX}</div>);

	//create each row
	tabla.rows.forEach(row => {
		const rowJSX = [];
		const rowCellValues = Array(columnOrder.length);
		for (const field in row) {
			//put the field in the corresponding place in the row
			rowCellValues[columnOrder.indexOf(field)] = row[field];
		}

		//actually write the JSX for the row with the ordered values
		rowCellValues.forEach((value, index) => {
			rowJSX.push(<div className='table-cell'>
				<input name={rowCellValues[index]} defaultValue={value} type='text' />
			</div>);
		});

		//add the JSX of each row to 'filas'
		filas.push(<form key={`${tabla.tableName}-${row['producto_id']}`} action={`${config.SERVER_ADDRESS}/tables/${tabla.tableName}`} className='table-row' method="PUT">
			{rowJSX}
		</form>
		);
	});

	return (
		<div className='table'>
			{filas}
		</div>
	);
}