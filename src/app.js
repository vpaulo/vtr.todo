window.addEventListener('load', () => {
	console.log('window loaded');
});
(() => {
	console.log('loaded');

	const db = new Worker('./js/workers/dbw.js');

	const taskInput = document.getElementById('task');
	const addTask = document.querySelector('.add-task');
	const taskList = document.querySelector('.tasks__list');
	const detailsContainer = document.querySelector('.details');
	const titleInput = document.querySelector('.title');
	const rename = document.querySelector('.rename');
	const remove = document.querySelector('.remove');
	const close = document.querySelector('.close');
	const myDay = document.querySelector('.my-day');
	const importantBtn = document.querySelector('.important');
	const note = document.querySelector('.note');
	const countElems = document.querySelectorAll('.count');

	function init() {
		db.postMessage({ type: 'launch' });
		db.onmessage = workerOnMessage;
	}

	function workerOnMessage(event) {
		switch (event.data.type) {
			case 'launch':
				console.log('web worker initialised: ', event.data);
				break;
			case 'opened':
				console.log(event.data.message);
				addEventListeners();
				db.postMessage({ type: 'display' });
				db.postMessage({ type: 'getAll'});
				break;
			case 'clear':
				console.log(event.data.message);
				taskInput.value = '';
				taskList.innerHTML = '';
				break;
			case 'tasks':
				console.log(`Task: ${event.data.value.id} - ${event.data.value.title}`);
				taskList.innerHTML += `<li data-id="${event.data.value.id}"><button class="show-details">${event.data.value.title}</button>`;
				break;
			case 'details':
				console.log('Details: ', event.data);
				showDetails(event.data.value);
				break;
			case 'success':
				console.log('Success: ', event.data);
				break;
			case 'allTasks':
				console.log('allTasks: ', event.data);
				update(event.data.value);
				break;
			default:
				console.log(`Error running db worker - type: ${event.data.type} does not exist`);
				break;
		}
	}

	function addEventListeners() {
		addTask.addEventListener('click', () => {
			const title = taskInput.value.trim();
			if (title) {
				db.postMessage({ type: 'addTask', title });
			} else {
				console.log('Required field(s) missing');
			}

		}, false);

		taskList.addEventListener('click', (e) => {
			// if (e.target.classList.contains('remove-task')) {
			// 	const elem = e.target.parentNode;
			// 	const id = +elem.dataset.id; // convert id to number
			// 	db.postMessage({ type: 'removeTask', id });
			// }
			// if (e.target.classList.contains('update-task')) {
			// 	const elem = e.target.parentNode;
			// 	const title = elem.querySelector('input').value;
			// 	const id = +elem.dataset.id; // convert id to number
			// 	db.postMessage({ type: 'updateTask', id, title });
			// }
			if (e.target.classList.contains('show-details')) {
				const elem = e.target.parentNode;
				const id = +elem.dataset.id; // convert id to number
				db.postMessage({ type: 'showDetails', id });
				detailsContainer.classList.remove('details--closed');
			}
		}, false);

		taskInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				const title = taskInput.value.trim();
				const creationDate = Date.now();
				if (title) {
					db.postMessage({ type: 'addTask', title, creationDate });
				} else {
					console.log('Required field(s) missing');
				}
			}
		}, false);

		titleInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				const title = titleInput.value.trim();
				const id = +detailsContainer.dataset.id;
				if (title) {
					db.postMessage({ type: 'renameTask', id, title });
				} else {
					console.log('Required field(s) missing');
				}
			}
		}, false);

		rename.addEventListener('click', () => {
			const title = titleInput.value.trim();
			const id = +detailsContainer.dataset.id; // convert id to number
			if (title) {
				db.postMessage({ type: 'renameTask', id, title });
			} else {
				console.log('Required field(s) missing');
			}
		}, false);

		remove.addEventListener('click', () => {
			const id = +detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'removeTask', id });
		}, false);

		close.addEventListener('click', () => {
			detailsContainer.classList.add('details--closed');
		}, false);

		importantBtn.addEventListener('click', () => {
			const id = +detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'importantTask', id });
		}, false);

		myDay.addEventListener('click', () => {
			const id = +detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'myDayTask', id });
		}, false);

		note.addEventListener('blur', () => {
			const id = +detailsContainer.dataset.id; // convert id to number
			const text = note.value.trim();
			if (text) {
				db.postMessage({ type: 'noteTask', id, note: text });
			} else {
				console.log('Required field(s) missing');
			}
		}, false);
	}

	function showDetails(data) {
		detailsContainer.setAttribute('aria-label', `Detail for task: ${data.title}`);
		detailsContainer.dataset.id = data.id;
		titleInput.value = data.title;
	}

	function update(data) {
		const myDayTotal = data.filter(d => d.my_day).length;
		const importantTotal = data.filter(d => d.important).length;
		const tasksListTotal = data.length; // TODO: change total for tasks list after adding lists functionality
		Array.from(countElems).forEach(elem => {
			if (elem.classList.contains('count-my-day')) {
				elem.innerText = myDayTotal;
			}
			if (elem.classList.contains('count-important')) {
				elem.innerText = importantTotal;
			}
			if (elem.classList.contains('count-tasks')) {
				elem.innerText = tasksListTotal;
			}
		});
	}

	init();
})();