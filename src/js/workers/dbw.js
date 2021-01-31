const DB_NAME = 'rminder';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'tasks';
let db;
// TODO: cleanup code
function openDb() {
	console.log('openDb ...');
	const req = indexedDB.open(DB_NAME, DB_VERSION);
	req.onsuccess = () => {
		db = req.result;
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
		db = req.result;
		const store = db.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

		// store.createIndex('id', 'id', { unique: true });
		store.createIndex('title', 'title', { unique: false });
		store.createIndex('important', 'important', { unique: false });
		store.createIndex('my_day', 'my_day', { unique: false });
		store.createIndex('note', 'note', { unique: false });
		store.createIndex('creation_date', 'creation_date', { unique: false });

		useDB();
	};
}

function useDB() {
	db.onversionchange = (evt) => {
		db.close();
		console.log('openDb: A new version of this page is ready. Please reload or close this tab!', evt);
	};
}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
	return db.transaction(store_name, mode).objectStore(store_name);
}

function addTask(title, creation_date) {
	const obj = { title, creation_date };
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
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
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
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

function updateTaskById(id, newTitle) {
	// console.log('updateTaskById: ', id, newTitle);
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			// console.log('>>>', cursor.value);
			if (cursor.value.id === id && cursor.value.title !== newTitle) {
				const updateData = cursor.value;

				updateData.title = newTitle;

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): updated` });
				};
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
			displayTasks(store);
		}
	};
}

function showDetails(id) {
	console.log('showDetails: ', id);
	const store = getObjectStore(DB_STORE_NAME, 'readonly');
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

function renameTask(id, newTitle) {
	// console.log('renameTask: ', id, newTitle);
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id && cursor.value.title !== newTitle) {
				const updateData = cursor.value;

				updateData.title = newTitle;

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): renamed` });
				};
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
			displayTasks(store);
		}
	};
}

function importantTask(id) {
	// console.log('importantTask: ', id);
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id) {
				const updateData = cursor.value;

				updateData.important = !updateData.important;

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): important = ${updateData.important}` });
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

function myDayTask(id) {
	// console.log('myDayTask: ', id);
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id) {
				const updateData = cursor.value;

				updateData.my_day = !updateData.my_day;

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): My day = ${updateData.my_day}` });
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

function noteTask(id, note) {
	// console.log('noteTask: ', id, note);
	const store = getObjectStore(DB_STORE_NAME, 'readwrite');
	store.openCursor().onsuccess = (evt) => {
		const cursor = evt.target.result;
		if (cursor) {
			if (cursor.value.id === id && cursor.value.note !== note) {
				const updateData = cursor.value;

				updateData.note = note;

				const request = cursor.update(updateData);
				request.onsuccess = () => {
					postMessage({ type: 'success', message: `Task(${id}): note` });
				};
			}

			// Move on to the next object in store
			cursor.continue();
		} else {
			console.log('No more entries');
			displayTasks(store);
		}
	};
}

function getAll() {
	const store = getObjectStore(DB_STORE_NAME, 'readonly');
	store.getAll().onsuccess = (e) => {
		postMessage({ type: 'allTasks', value: e.target.result });
	};
}

function displayTasks(store) {

	if (typeof store == 'undefined') {
		store = getObjectStore(DB_STORE_NAME, 'readonly');
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
		// case 'delete':
		// 		const { key } = e.data;
		// 		deletePublication(key);
		// 		break;
		case 'removeTask':
			removeTaskById(e.data.id);
			break;
		case 'updateTask':
			updateTaskById(e.data.id, e.data.title);
			break;
		case 'renameTask':
			renameTask(e.data.id, e.data.title);
			break;
		case 'showDetails':
			showDetails(e.data.id);
			break;
		case 'importantTask':
			importantTask(e.data.id);
			break;
		case 'myDayTask':
			myDayTask(e.data.id);
			break;
		case 'noteTask':
			noteTask(e.data.id, e.data.note);
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