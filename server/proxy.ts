import http from 'http';
import https from 'https';

const PORT = 3051;
const server = http.createServer((req,res) => {
  res.setHeader('access-control-allow-origin', '*');
  if (!req.url) return res.end();
  const target = 'https:/'+req.url;
  try {
    const proxyReq = https.request(target, proxyRes => {
      console.log(`statusCode: ${proxyRes.statusCode}, target: ${target}`);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', error => {
      console.error('error:', error);
    });
    proxyReq.end(); // terminate our message request. otherwise, servers would keep waiting for our messages.
  } catch(e) {
    console.error('cause:', e);
    res.statusCode=500;
    res.end();
  }
});
server.on('listening', () =>{
  console.log('listening on port', PORT);
});
server.listen(PORT);
