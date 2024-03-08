import { createServer } from 'http';

const onRequest = function (request, response) {
    if (request.method === 'POST') {
        let body = '';

        request.on('data', (chunk) => {
            body += chunk;
        });

        request.on('end', () => {
            const data = JSON.parse(body);
            console.log(data);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: true }));
        });
    }
}

const server = createServer(onRequest);
server.listen(8080, '127.0.0.1');
console.log('server started on localhost port 8080');
