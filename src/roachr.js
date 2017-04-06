


const roachr = {};

if (!process.env.ROACHR_SEGMENT_KEY) {
  throw new Error('Have you forgetten to add Roachrs segment key with Torus?');
}

roachr.segmentKey = process.env.ROACHR_SEGMENT_KEY;

roachr.whitelist = process.env.NODE_ENV === 'development' ? [
  'http://localhost:1313',
  '*.arigato.tools'
] : [
  'https://*.roachr.com',
  'https://*.*.manifold.co',
  'https://*.ampproject.org',
  'https://*.amp.cloudflare.com',
  'https://roachr-stage.netlify.com'
];

module.exports = roachr;
