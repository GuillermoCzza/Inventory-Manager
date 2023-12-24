//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';



function Tabla(tabla) {


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





function App() {
	const [lang, setLanguage] = React.useState(language.en);
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null);
	let [loadError, setLoadError] = React.useState(null);

	React.useEffect(() => {
		setCurrentTable(null);
		fetch(config.SERVER_ADDRESS + "/tables")
			.then(res => {
				return res.json();
			})
			.then(data => {
				setTableList(data.rows);
			})
			.catch(err => {
				setLoadError(lang.error + err.toString());
			});
	}, [lang.error]);

	return (
		<div className="App">
			<header className="App-header">
				<LanguageSelector />
				{/* <img src={logo} className="App-logo" alt="logo" /> */}
				<h1>{lang.title}</h1>
			</header>

			<div className='App-main'>

				{currentTable ? Tabla(currentTable) :
					(tableList ? ListaDeTablas(tableList) :
						(!loadError ? <p>{lang.loading}</p> : loadError))}


			</div>
		</div>
	);

	function ListaDeTablas(tablas) {
		//each of the table buttons will call this on click
		const loadTable = (event) => {
			//get the table name from the button's table property, which is the table name in the db
			const tableName = event.target.getAttribute('table');
			//make a request and load the table
			fetch(`${config.SERVER_ADDRESS}/tables/${tableName}`)
				.then(res => res.json())
				.then(data => {
					data.tableName = tableName; //add tablename to table object so it can be retrieved in Tabla()
					setCurrentTable(data);
				})
				.catch(err => {
					alert(lang.error + err.toString());
				});

		}

		//create the list of buttons to go to each table
		const lista = [];
		tablas.forEach(row => {
			const tableName = row.table_name;
			lista.push(
				<button table={tableName} onClick={loadTable} className="link-tabla">
					{tableName}
				</button>
			);
		});

		return <div id="lista-tablas">{lista.concat(<NewTableButton />)}</div>;
	}

	//button to create a new table
	function NewTableButton() {
		const createTable = async () => {
			const newTableName = prompt(lang.newTablePrompt)
			await fetch(`${config.SERVER_ADDRESS}/tables`, {
				method: "POST",
				redirect: 'follow',
				body: JSON.stringify({
					tableName: newTableName
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			})
				.then(res => res.json())
				.then(data => {
					setTableList(data.rows);
				})
				.catch(err => { alert(lang.error + err) });
		};

		return <button id="new-table-button" onClick={createTable}>+</button>;
	}

	//language change select element
	function LanguageSelector() {
		const changeLanguage = (event) => {
			const selectedLanguage = event.target.value;
			setLanguage(language[selectedLanguage]);
		}

		return (
			<div id="language-selection">
				<p>{lang.language}</p>
				<select value={lang.code} onChange={changeLanguage}>
					<option value="en">English</option>
					<option value="es">Español</option>
				</select>
			</div>
		)
	}
}

export default App;
