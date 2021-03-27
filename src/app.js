import { Rminder } from './js/Rminder.js';
import { dbMessage } from './js/dbMessage.js';
(() => {
	const rminder = new Rminder();
	const db = new Worker('./js/workers/dbw.js');

	db.postMessage({ type: 'launch' });
	db.onmessage = (event) => dbMessage(rminder, event.data, db);

	rminder.screenTest(); 
})();