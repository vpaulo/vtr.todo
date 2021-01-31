import { logger } from './logger.js';
// TODO: cleanup code
export class Rminder {
	constructor() {
		this.taskInput = document.getElementById('task');
		this.addTask = document.querySelector('.add-task'); // TODO: change to querySelectorAll
		this.taskList = document.querySelector('.tasks__list');
		this.detailsContainer = document.querySelector('.details');
		this.titleInput = document.querySelector('.title');
		this.rename = document.querySelector('.rename');
		this.remove = document.querySelector('.remove');
		this.close = document.querySelector('.close');
		this.myDay = document.querySelector('.my-day');
		this.importantBtn = document.querySelector('.important');
		this.note = document.querySelector('.note');
		this.countElems = document.querySelectorAll('.count');
	}

	launch(data) {
		logger('web worker initialised: ', data);
	}

	success(data) {
		logger('Success: ', data);
	}

	opened(data, db) {
		logger(data.message);
		this.addEventListeners(db);
		db.postMessage({ type: 'display' });
		db.postMessage({ type: 'getAll' });
	}

	clear(data) {
		logger(data.message);
		this.taskInput.value = '';
		this.taskList.innerHTML = '';
	}

	tasks(data) {
		logger(`Task: ${data.value.id} - ${data.value.title}`);
		this.taskList.innerHTML += `<li data-id="${data.value.id}"><button class="show-details">${data.value.title}</button>`;
	}

	details(data) {
		logger('Details: ', data);
		this.detailsContainer.setAttribute('aria-label', `Detail for task: ${data.value.title}`);
		this.detailsContainer.dataset.id = data.value.id;
		this.titleInput.value = data.value.title;
		this.note.value = data.value.note || '';
	}

	allTasks(data) {
		logger('allTasks: ', data);
		const myDayTotal = data.value.filter(d => d.my_day).length;
		const importantTotal = data.value.filter(d => d.important).length;
		const tasksListTotal = data.value.length; // TODO: change total for tasks list after adding lists functionality
		Array.from(this.countElems).forEach(elem => {
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

	addEventListeners(db) {
		this.addTask.addEventListener('click', () => {
			const title = this.taskInput.value.trim();
			if (title) {
				db.postMessage({ type: 'addTask', title });
			} else {
				console.log('Required field(s) missing');
			}

		}, false);

		this.taskList.addEventListener('click', (e) => {
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
				this.detailsContainer.classList.remove('details--closed');
			}
		}, false);

		this.taskInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				const title = this.taskInput.value.trim();
				const creationDate = Date.now();
				if (title) {
					db.postMessage({ type: 'addTask', title, creationDate });
				} else {
					console.log('Required field(s) missing');
				}
			}
		}, false);

		this.titleInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				const title = this.titleInput.value.trim();
				const id = +this.detailsContainer.dataset.id;
				if (title) {
					db.postMessage({ type: 'renameTask', id, title });
				} else {
					console.log('Required field(s) missing');
				}
			}
		}, false);

		this.rename.addEventListener('click', () => {
			const title = this.titleInput.value.trim();
			const id = +this.detailsContainer.dataset.id; // convert id to number
			if (title) {
				db.postMessage({ type: 'renameTask', id, title });
			} else {
				console.log('Required field(s) missing');
			}
		}, false);

		this.remove.addEventListener('click', () => {
			const id = +this.detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'removeTask', id });
		}, false);

		this.close.addEventListener('click', () => {
			this.detailsContainer.classList.add('details--closed');
		}, false);

		this.importantBtn.addEventListener('click', () => {
			const id = +this.detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'importantTask', id });
		}, false);

		this.myDay.addEventListener('click', () => {
			const id = +this.detailsContainer.dataset.id; // convert id to number
			db.postMessage({ type: 'myDayTask', id });
		}, false);

		this.note.addEventListener('blur', () => {
			const id = +this.detailsContainer.dataset.id; // convert id to number
			const text = this.note.value.trim();
			if (text) {
				db.postMessage({ type: 'noteTask', id, note: text });
			} else {
				console.log('Required field(s) missing');
			}
		}, false);
	}
}