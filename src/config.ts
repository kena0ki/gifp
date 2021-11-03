const local = location.protocol + '//' + location.hostname + ':3051';
const PROXY_HOST = DEBUG ? local: 'https://cors.znoo.xyz';
export default {
  PROXY_HOST,
};
