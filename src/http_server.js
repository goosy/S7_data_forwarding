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

export function start_http_server(port) {
    const server = createServer(onRequest);
    port ??= 18080;
    server.listen(port, '0.0.0.0');
    console.log(`server started on localhost:${port}`);
}
