const rminder = {
	name: 'rminder',
	version: 1, // Use a long long for this value (don't use a float)
	storeNames: ['tasks'],
};

function openDb() {
	console.log('openDb ...');
	const req = indexedDB.open(rminder.name, rminder.version);
	req.onsuccess = () => {
		rminder.db = req.result;
		console.log('openDb DONE');
		useDB();
		postMessage({ type: 'opened', message: 'DB opened' });
	};
	req.onerror = (evt) => {
		console.error('openDb:', evt.target.error);
	};

	req.onblocked = (evt) => {
		console.error('openDb: Please close all other tabs with the App open', evt.target.error);
	};

	req.onupgradeneeded = () => {
		console.log('openDb.onupgradeneeded');
		rminder.db = req.result;
		const store = rminder.db.createObjectStore(rminder.storeNames[0], { keyPath: 'id', autoIncrement: true });

		// store.createIndex('id', 'id', { unique: true });
		store.createIndex('title', 'title', { unique: false });
		store.createIndex('important', 'important', { unique: false });
		store.createIndex('my_day', 'my_day', { unique: false });
		store.createIndex('completed', 'completed', { unique: false });
		store.createIndex('note', 'note', { unique: false });
		store.createIndex('creation_date', 'creation_date', { unique: false });

		useDB();
	};
}

function useDB() {
	rminder.db.onversionchange = (evt) => {
		rminder.db.close();
		console.log('openDb: A new version of this page is ready. Please reload or close this tab!', evt);
	};
}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
	return rminder.db.transaction(store_name, mode).objectStore(store_name);
}

function addTask(title, creation_date) {
	const obj = { title, creation_date };
	const store = getObjectStore(rminder.storeNames[0], 'readwrite');
	let req;
	try {
		req = store.add(obj);
	} catch (e) {
		if (e.name == 'DataCloneError') {
			postMessage({ type: 'failure', message: 'This engine doesn\'t know how to clone a Blob, use Firefox' });
		}

		throw e;
	}
	req.onsuccess = () => {
		console.log('Insertion in DB successful');
		postMessage({ type: 'success' });
		displayTasks(store);
		getAll();
	};
	req.onerror = () => {
		console.error('addTask error', req.error);
		postMessage({ type: 'failure', message: req.error });
	};
}

function removeTaskById(id) {
	// console.log('removeTaskById: ', id);
	const store = getObjectStore(rminder.storeNames[0], 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id) {
				const request = cursor.delete();
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): deleted` });
				};
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
			displayTasks(store);
			getAll();
		}
	};
}

function showDetails(id) {
	console.log('showDetails: ', id);
	const store = getObjectStore(rminder.storeNames[0], 'readonly');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id) {
				postMessage({ type: 'details', key: cursor.key, value: cursor.value });
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
		}
	};
}

function updateTask(id, field, fieldValue) {
	console.log('updateTask: ', id, field, fieldValue);
	const store = getObjectStore(rminder.storeNames[0], 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			const newValue = !fieldValue || cursor.value[field] !== fieldValue; // if field value undefined return true, otherwise compare values
			if (cursor.value.id === id && newValue) {
				const updateData = cursor.value;

				updateData[field] = fieldValue || !updateData[field]; // if field value undefined treat it as a boolean update

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): ${field} = ${updateData[field]}` });
				};
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
			getAll();
		}
	};
}

function getAll() {
	const store = getObjectStore(rminder.storeNames[0], 'readonly');
	store.getAll().onsuccess = (e) => {
		postMessage({ type: 'allTasks', value: e.target.result });
	};
}

function displayTasks(store) {

	if (typeof store == 'undefined') {
		store = getObjectStore(rminder.storeNames[0], 'readonly');
	}

	postMessage({ type: 'clear', message: 'Clear' });

	const reqCursor = store.openCursor();
	reqCursor.onsuccess = (evt) => {
		const cursor = evt.target.result;

		// If the cursor is pointing at something, ask for the data
		if (cursor) {
			// console.log("displayTasks cursor:", cursor);
			const req = store.get(cursor.key);
			req.onsuccess = (e) => {
				// console.log('tasks: ', cursor.key, e.target.result);
				postMessage({ type: 'tasks', key: cursor.key, value: e.target.result });
			};

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
		}
	};
}

onmessage = (e) => {
	const { type } = e.data;

	switch (type) {
		// case 'getBlob':
		// 		getBlob(e.data.key);
		// 		break;
		case 'addTask':
			addTask(e.data.title, e.data.creationDate);
			break;
		case 'removeTask':
			removeTaskById(e.data.id);
			break;
		case 'renameTask':
			updateTask(e.data.id, 'title', e.data.title);
			break;
		case 'showDetails':
			showDetails(e.data.id);
			break;
		case 'importantTask':
			updateTask(e.data.id, 'important');
			break;
		case 'myDayTask':
			updateTask(e.data.id, 'my_day');
			break;
		case 'noteTask':
			updateTask(e.data.id, 'note', e.data.note);
			break;
		case 'completedTask':
			updateTask(e.data.id, 'completed');
			break;
		case 'getAll':
			getAll();
			break;
		// case 'clear':
		// 		clearObjectStore();
		// 		break;
		case 'display':
			displayTasks();
			break;
		default:
			postMessage({ type });
			break;
	}
};

openDb();