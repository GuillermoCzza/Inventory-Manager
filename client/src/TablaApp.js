import React from 'react';
import config from './clientConfig.json';


export default function TableApp(props) {
	//TODO: add sorting

	const { currentTable: tabla, lang, setTable } = props;
	const tableName = tabla.tableName;
	const tableUrl = `${config.SERVER_ADDRESS}/tables/${tableName}`;

	//this is for searching the tables
	const [searchTerm, setSearchTerm] = React.useState("")
	const [searchField, setSearchField] = React.useState("");

	return (
		<div className='table-frame'>
			<div className='toolbar'>
				<ReturnButton />
				<SearchBar />
			</div>
			<Tabla />
			{tabla.rows.length === 0 ? <p>{lang.emptyTable}</p> : null}
			<NewRowButton />
		</div>
	);


	//components and auxiliary functions below this point

	//components

	function SearchBar() {
		//fill out options for the search column select with all the columns
		const optionsJSX = [];
		for (const field of tabla.fields) {
			optionsJSX.push(<option key={`${field.name}-option`} value={field.name}>{field.name}</option>)
		}

		return (
			<div id="search-container">
				<label key="search-bar-label" htmlFor="search-bar">{lang.search}</label>
				<input key="search-bar" value={searchTerm} id='search-bar' onChange={changeSearchTerm} autoFocus></input>
				<select value={searchField} onChange={changeSearchField} id="search-column-select">
					{optionsJSX}
				</select>
			</div>
		)

		function changeSearchTerm(e) {
			const newSearchTerm = e.target.value;
			setSearchTerm(newSearchTerm);
		}

		function changeSearchField(e) {
			const selectedField = e.target.value;
			setSearchField(selectedField);
		}
	}

	function Tabla(props) {

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
				{DeleteRowButton(row)}
			</form>
			);
		}

		return (
			<div className='table'>
				{tableHeader}
				{tabla.rows.length !== 0 ? filas : null}
			</div>
		)
	}

	function ReturnButton() {
		function handleClick() {
			setTable(null, null)
		}

		return (
			<button id="return-button" onClick={handleClick}>{"<"}</button>
		)
	}

	function NewRowButton() {
		return (
			<button className='new-row-button' onClick={createRow}>{lang.newRow}</button>
		);
	}

	function DeleteRowButton(row) {
		return (
			<button type="button" onClick={() => { deleteRow(row) }} className='delete-row-button'>x</button>
		);
	}


	//functions

	//this function performs any request and automatically updates the table state
	function doRequest(url, body, supressAlert = false) {
		fetch(url, body)
			.then(res => res.json())
			.then(data => {
				//if the response contains an error message, throw the error
				if (data.error) {
					throw data.error;
				}
				setTable(data, tableName);
			})
			.catch(err => {
				if (!supressAlert) {
					alert(err);
				} else {
					console.error(err);
				}
			})
	}

	function createRow() {
		//Perform POST request
		doRequest(tableUrl, {
			method: "POST",
		});
	}

	function deleteRow(row) {
		//perform DELETE request
		doRequest(tableUrl, {
			method: "DELETE",
			body: JSON.stringify({ row: row }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}, true);
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
		doRequest(tableUrl, {
			method: "PUT",
			body: JSON.stringify({ keyValuePairs: keyValuePairs }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
	}
}