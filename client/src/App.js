//import logo from './logo.svg';
import './App.css';
import React from 'react';
import config from './clientConfig.json'

function ListaDeTablas(tablas) {
	const lista = [];

	tablas.forEach(row => {
		const tableName = row.table_name;
		lista.push(
			<a href={`${config.SERVER_ADDRESS}/tables/${tableName}`} className="link-tabla">
				{row.table_name}
			</a>
		);
	});

	return (
		<div id="lista-tablas">{lista}</div>
	);
}

function Tabla(tabla) {
	return (
		<p></p>
	);
}

function App() {
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null);

	const NewTableButton = () => {
		const handleClick = async () => {
			/*Put something here*/
		};
		return <button onClick={handleClick}>Create New Table</button>;
	}

	React.useEffect(() => {
		setCurrentTable(null);
		fetch(config.SERVER_ADDRESS + "/tables")
			.then(res => {
				return res.json();
			})
			.then(data => {
				console.log(data.rows);
				setTableList(data.rows);
			})
			.catch(err => console.error("An error has ocurred: ", err));
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				{/* <img src={logo} className="App-logo" alt="logo" /> */}
				<h1>Administrador de Inventario</h1>
			</header>
			<div className='App-main'>
				{currentTable ? Tabla(currentTable) :
					(tableList ? ListaDeTablas(tableList) :
						<p>"Loading..."</p>)}
				<NewTableButton />
			</div>
		</div>
	);
}

export default App;
