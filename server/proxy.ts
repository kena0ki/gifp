import http from 'http';
import https from 'https';

const PORT = 3051;
const server = http.createServer((req,res) => {
  res.setHeader('access-control-allow-origin', '*');
  if (!req.url) return res.end();
  const target = 'https:/'+req.url;
  const MAX_REDIRECTS=10;
  let redirect_cnt=0;
  const loop = (target: string) => {
    try {
      const proxyReq = https.request(target, proxyRes => {
        console.log(`statusCode: ${proxyRes.statusCode}, target: ${target}`);
        const redirectUrl = proxyRes.headers.location;
        if (redirectUrl && redirect_cnt < MAX_REDIRECTS) {
          redirect_cnt++;
          loop(redirectUrl);
        } else {
          proxyRes.pipe(res);
        }
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
  };
  loop(target);
});
server.on('listening', () =>{
  console.log('listening on port', PORT);
});
server.listen(PORT);
