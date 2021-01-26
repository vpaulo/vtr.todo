(() => {
	console.log('loaded');

	const db = new Worker('./js/workers/dbw.js');

	const taskInput = document.getElementById('task');
	const addTask = document.querySelector('.add-task');
	const taskList = document.querySelector('.tasks__list');

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
				break;
			case 'clear':
				console.log(event.data.message);
				taskInput.value = '';
				taskList.innerHTML = '';
				break;
			case 'tasks':
				console.log(`Task: ${event.data.value.id} - ${event.data.value.title}`);
				taskList.innerHTML += `<li data-id="${event.data.value.id}"><input type="text" value="${event.data.value.title}"><button class="update-task">update</button><button class="remove-task">remove</button></li>`;
				break;
			case 'success':
				console.log('Success: ', event.data);
				break;
			default:
				console.log(`Error running db worker - type: ${event.data.type} does not exist`);
				break;
		}
	}

	function addEventListeners() {
		addTask.addEventListener('click', () => {
			const title = taskInput.value;
			if (title) {
				db.postMessage({ type: 'addTask', title });
			} else {
				console.log('Required field(s) missing');
			}

		}, false);

		taskList.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-task')) {
				const elem = e.target.parentNode;
				const id = +elem.dataset.id; // convert id to number
				db.postMessage({ type: 'removeTask', id });
			}
			if (e.target.classList.contains('update-task')) {
				const elem = e.target.parentNode;
				const title = elem.querySelector('input').value;
				const id = +elem.dataset.id; // convert id to number
				db.postMessage({ type: 'updateTask', id, title });
			}
		}, false);

		taskInput.addEventListener('keyup', event => {
			// if (event.isComposing || event.keyCode === 229) {
			// 	return;
			// }
			console.log('>>>> ', event);
			if (event.code === 'Enter') {
				const title = taskInput.value;
				if (title) {
					db.postMessage({ type: 'addTask', title });
				} else {
					console.log('Required field(s) missing');
				}
			}
			// do something
		});
	}

	init();
})();