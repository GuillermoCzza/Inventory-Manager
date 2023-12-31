import React from 'react';

export default function TableApp(props) {

	//TODO: add sorting

	const { currentTable: tabla, lang, setTable } = props;
	const tableName = tabla.tableName;
	


	return (
		<div className='table-frame'>
			<p>{lang.pressEnterNote}</p>
			<div className='toolbar'>
				<ReturnButton />
				<SearchBar {...props} />
			</div>
			<Tabla {...props} tableName={tableName}/>
			{tabla.rows.length === 0 ? <p>{lang.emptyTable}</p> : null}
			<NewRowButton {...props} tableName={tableName}/>
		</div>
	);


	//components and auxiliary functions below this point



	function ReturnButton() {
		function handleClick() {
			setTable(null, null)
		}

		return (
			<button id="return-button" onClick={handleClick}>{"<"}</button>
		)
	}

	

	
}

function SearchBar(props) {
	const { currentTable: tabla, lang, searchTerm, setSearchTerm, searchField, setSearchField, tableRequest } = props;

	//fill out options for the search column select with all the columns
	const optionsJSX = [<option key={`unselected-option`} value={""}>{`--${lang.choose}--`}</option>];
	for (const field of tabla.fields) {
		optionsJSX.push(<option key={`${field.name}-option`} value={field.name}>{field.name}</option>)
	}

	return (
		<div id="search-container">
			<label key="search-bar-label" htmlFor="search-bar">{lang.search}</label>
			<input value={searchTerm} key="search-bar" id='search-bar' onChange={changeSearchTerm}></input>
			<select value={searchField} onChange={changeSearchField} id="search-column-select">
				{optionsJSX}
			</select>
		</div>
	)

	function changeSearchTerm(e) {
		const newSearchTerm = e.target.value;
		//update state of Tabla
		setSearchTerm(newSearchTerm);
	}

	function changeSearchField(e) {
		const selectedField = e.target.value;
		//update state of Tabla
		setSearchField(selectedField);
	}
}

//table component
function Tabla(props) {
	const { currentTable: tabla, tableName, setTable, searchTerm, searchField, tableRequest } = props;

	const columnOrder = []; //necessary to write values of rows in same order

	//create table headers and record column order for the fields
	const headersJSX = []
	for (const field of tabla.fields) {
		const fieldName = field.name.toUpperCase();
		headersJSX.push(<div key={`${tabla.tableName}-${field.name}-header`} className='table-cell'><p>{fieldName}</p></div>)
		columnOrder.push(field.name);
	}

	const tableHeader = <div key={`${tabla.tableName}-headers-row`} className='table-row table-headers'>{headersJSX}</div>;

	const filas = []; //this will contain the JSX of all the rows
	//create each row (none will be added if there's 0)
	for (const row of tabla.rows) {
		//if the search settings aren't falsy (like ""),
		//skip create row JSX (i.e. don't render it) if it doesn't match search
		if (searchField && searchTerm &&
			(row[searchField] === null || !row[searchField].toString().startsWith(searchTerm))) {
			continue;
		}

		const rowJSX = [];
		const rowCellValues = Array(columnOrder.length);
		for (const field in row) {
			//put the field in the corresponding place in the row
			rowCellValues[columnOrder.indexOf(field)] = row[field];
		}

		//actually write the JSX for the row with the ordered values
		rowCellValues.forEach((value, index) => {
			rowJSX.push(<div key={`${columnOrder[index]}-cell`} className='table-cell'>
				<input name={columnOrder[index]} defaultValue={value} type='text' />
			</div>);
		});

		//add the JSX of each row to 'filas'
		filas.push(<form onSubmit={(e) => { handleSubmit(e) }} key={`${tabla.tableName}-${row['producto_id']}`} className='table-row'>
			{rowJSX}
			<input type="submit" hidden /> {/*add hidden submit button to each row, for submission on enter*/}
			<DeleteRowButton row={row} {...props}/>
		</form>
		);
	}

	return (
		<div className='table'>
			{tableHeader}
			{tabla.rows.length !== 0 ? filas : null}
		</div>
	)

	function handleSubmit(e) {
		e.preventDefault(); //I need this for the page not to reload, and to format the form data like I want
		const formData = new FormData(e.target);

		//Get all the key value pairs in an array for easy server support for any size of form
		const keyValuePairs = [];
		for (const [key, value] of formData.entries()) {
			keyValuePairs.push({ key: key, value: value });
		}

		//perform PUT request
		tableRequest(tableName, {
			method: "PUT",
			body: JSON.stringify({ keyValuePairs: keyValuePairs }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}, setTable);
	}
}


function NewRowButton(props) {
	const { tableName, setTable, lang, tableRequest } = props;
	return (
		<button className='new-row-button' onClick={() => createRow(tableName, setTable, tableRequest)}>{lang.newRow}</button>
	);
}

function DeleteRowButton(props) {
	const { row, tableName, setTable, tableRequest } = props;
	return (
		<button type="button" onClick={() => { deleteRow(row, tableName, setTable, tableRequest) }} className='delete-row-button'>x</button>
	);
}


function createRow(tableName, setTable, tableRequest) {
	//Perform POST request
	tableRequest(tableName, {
		method: "POST",
	}, setTable);
}

function deleteRow(row, tableName, setTable, tableRequest) {
	//perform DELETE request
	tableRequest(tableName, {
		method: "DELETE",
		body: JSON.stringify({ row: row }),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	}, setTable, true, () => {console.log("eeeiiiiiaaaa")});
}