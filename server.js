import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 5500;
const app = express();

//we need to change up how __dirname is used for ES6 purposes
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'docs')));
app.listen(port, async () => {});

// import { express } from 'express';
// import { stoppable } from 'stoppable';

// export async function createServer(port = 5500) {
// 	const app = express();
// 	app.use(express.static('docs'));
// 	return new Promise((resolve) => {
// 		const server = app.listen(port, () => resolve(stoppable(server)));
// 	});
// }

// Mock requests
// await page.setRequestInterception(true);
// page.on('request', async request => {

//   if (request.url().endsWith("/api/backendcall")) {
//     await request.respond({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify({ key: 'value' })
//     });
//   } else {
//     await request.continue();
//   }
// });