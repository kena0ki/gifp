import http from 'http';
import https from 'https';

const PORT = 5001;
const server = http.createServer((req,res) => {
  res.setHeader('access-control-allow-origin', '*');
  if ('access-control-request-headers' in req.headers) {
    res.setHeader('access-control-allow-headers', '*');
    res.end();
    console.error('preflight');
    return;
  }
  const target = req.headers['x-target'] as string;
  const proxyReq = https.request(target, proxyRes => {
    console.log(`statusCode: ${proxyRes.statusCode}`);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', error => {
    console.error(error);
  });
  proxyReq.end();
});
server.on('listening', () =>{
  console.log('listening on port', PORT);
});
server.listen(PORT);
