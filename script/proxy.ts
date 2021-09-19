import http from 'http';
import httpProxy from 'http-proxy';
import https from 'https';

const proxy = httpProxy.createProxyServer();
proxy.on('proxyRes', (pRes,req,res) => {
  console.log('proxyRes was called');
  res.setHeader('access-control-allow-origin', '*');
});
proxy.on('proxyReq', (pReq,req) => {
  console.log('proxyReq was called');
  pReq.removeHeader('referer');
  pReq.removeHeader('origin');
  pReq.removeHeader('host');
  console.log(pReq.getHeaders());
  console.log(req.headers);
});
const PORT = 5001;
proxy.on('error', (err) => {
  console.error('error:', err);
});
const server = http.createServer((req,res) => {
  if ('access-control-request-headers' in req.headers) {
    res.setHeader('access-control-allow-headers', '*');
    res.setHeader('access-control-allow-origin', '*');
    res.end();
    return;
  }
  const target = req.headers['x-target'] as string;
  delete req.headers.referer;
  delete req.headers.origin;
  delete req.headers.host;
  res.removeHeader('referer');
  res.removeHeader('origin');
  res.removeHeader('host');
  proxy.web(req, res, {target});
  const pReq = https.request(target, pRes => {
    console.log(`statusCode: ${res.statusCode}`);
    pRes.pipe(res);
  });
  pReq.on('error', error => {
    console.error(error);
  });
  pReq.end();
});
server.on('listening', () =>{
  console.log('listening on port', PORT);
});
server.listen(PORT);


function fetch(url:string) {
  const req = https.request(url, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.pipe();
    res.on('data', d => {
      process.stdout.write(d);
    });
  });


}