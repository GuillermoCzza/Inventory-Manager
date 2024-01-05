import React from 'react';
import clientConfig from './clientConfig.json'

export default function TableApp(props) {

	//TODO: add sorting

	const { currentTable: tabla, lang, setTable } = props;
	const tableName = tabla.tableName;


	return (
		<div className='table-frame'>
			<p className='note'>{lang.tableSortNote}</p>
			<div className='toolbar'>
				<ReturnButton setTable={setTable} />
				<SearchBar {...props} />
			</div>
			<Tabla {...props} tableName={tableName} />
			{tabla.rows.length === 0 ? <p>{lang.emptyTable}</p> : null}
			<NewRowButton {...props} tableName={tableName} />
		</div>
	);
}

function ReturnButton(props) {
	function handleClick() {
		props.setTable(null, null)
	}

	return (
		<button id="return-button" onClick={handleClick}>{"<"}</button>
	)
}

function SearchBar(props) {
	const { currentTable: tabla, lang, searchTerm, setSearchTerm, searchField, setSearchField } = props;

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
	const { currentTable: tabla, tableName, searchTerm, searchField, tableRequest, sortAscending, setSortAscending, sortField, setSortField } = props;

	const columnOrder = []; //necessary to write values of rows in same order

	//create table headers and record column order for the fields
	const headersJSX = []
	for (const field of tabla.fields) {
		const fieldName = field.name;
		const bigFieldName = fieldName.toUpperCase();
		headersJSX.push(
			<div onClick={handleClick} key={`${tabla.tableName}-${field.name}-header`} className='table-cell'>
				<p>{`${bigFieldName} ${fieldName === sortField ?
					(sortAscending ? "⮝" : "⮟") : ""}`}</p>
			</div>
		)
		columnOrder.push(field.name);

		//this controls sorting state changes
		function handleClick() {
			if (fieldName !== sortField) {
				setSortField(fieldName);
			} else {
				setSortAscending(!sortAscending)
			}
		}
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
		filas.push(<form onBlur={handleFormBlur} onSubmit={handleSubmit} key={`${tabla.tableName}-${row[clientConfig.IDENTIFIER_COLUMN]}`} className='table-row'>
			{rowJSX}
			<DeleteRowButton className="table-cell" row={row} {...props} />
			<input type="submit" hidden /> {/*add hidden submit button to each row, for submission on enter*/}
		</form>
		);
	}

	return (
		<div className='table'>
			{tableHeader}
			{tabla.rows.length !== 0 ? filas : null}
		</div>
	)

	function handleFormBlur(e) {
		const form = e.currentTarget; //get form node

		//get submit input of form
		let submitInput;
		for (const child of form){
			if (child.getAttribute('type') === 'submit') {
				submitInput = child;
				break;
			}
		}

		//do nothing if destination focus is a descendant of form
		if (form.contains(e.relatedTarget)) {
			return;
		}
		//if it isn't...
		submitInput.click();

	}

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
		});
	}
}


function NewRowButton(props) {
	const { tableName, lang, tableRequest } = props;
	return (
		<button className='new-row-button' onClick={() => createRow(tableName, tableRequest)}>{lang.newRow}</button>
	);
}

function DeleteRowButton(props) {
	const { row, tableName, tableRequest } = props;
	return (
		<button type="button" onClick={() => { deleteRow(row, tableName, tableRequest) }} className='delete-row-button'>x</button>
	);
}


function createRow(tableName, tableRequest) {
	//Perform POST request
	tableRequest(tableName, {
		method: "POST",
	});
}

function deleteRow(row, tableName, tableRequest) {
	//perform DELETE request
	tableRequest(tableName, {
		method: "DELETE",
		body: JSON.stringify({ row: row }),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	}, true);
}