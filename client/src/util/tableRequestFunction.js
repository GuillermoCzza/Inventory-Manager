export default function tableRequestFunction(setTable, sortField, sortAscending) {
	//this function performs any request and automatically updates the table state
	return function (tableName, request, supressAlert = false, successCallback = () => { }) {
		const query = new URLSearchParams({ sortField, sortAscending });
		const url = `/tables/${tableName}?${query}`;
		fetch(url, request)
			.then(res => res.json())
			.then(data => {
				//if the response contains an error message, throw the error
				if (data.error) {
					throw data.error;
				}

				setTable(data, tableName);
				successCallback();
			})
			.catch(err => {
				if (!supressAlert) {
					alert(err);
				} else {
					console.error(err);
				}
			})
	}

}