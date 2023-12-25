import config from './clientConfig.json';


export default function Tabla(tabla, lang) {
	const columnOrder = []; //necessary to write values of rows in same order


	//create table headers and record column order for the fields
	const headersJSX = []
	tabla.fields.forEach(field => {
		const fieldName = field.name.toUpperCase();
		headersJSX.push(<div key={`${tabla.tableName}-${field.name}-header`} className='table-cell'><p>{fieldName}</p></div>)
		columnOrder.push(field.name);
	});
	const tableHeader = <div key={`${tabla.tableName}-headers-row`} className='table-row table-headers'>{headersJSX}</div>;

	const filas = []; //this will contain the JSX of all the rows
	//create each row (none will be added if there's 0)
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
				<input name={columnOrder[index]} defaultValue={value} type='text' />
			</div>);
		});

		//add the JSX of each row to 'filas'
		filas.push(<form onSubmit={(e) => { handleSubmit(e, tabla.tableName) }} key={`${tabla.tableName}-${row['producto_id']}`} className='table-row'>
			{rowJSX}
			<input type="submit" hidden /> {/*add hidden submit button to each row, for submission on enter*/}
		</form>
		);
	});

	return (
		<div className='table-frame'>
			<div className='table'>
				{tableHeader}
				{tabla.rows.length !== 0 ? filas : null}
			</div>
			{tabla.rows.length === 0 ? <p>{lang.emptyTable}</p> : null}
		</div>
	);


}

function handleSubmit(e, tableName) {
	e.preventDefault();
	const formData = new FormData(e.target);

	

	const requestBody = {};

	for (var [key, value] of formData.entries()) {
		console.log(key, value);
		requestBody[key] = value;
	} 



	fetch(`${config.SERVER_ADDRESS}/tables/${tableName}`, {
		method: "PUT",
		body: JSON.stringify(requestBody),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
};