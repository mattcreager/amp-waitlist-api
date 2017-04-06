
const express = require('express');
const formidable = require('express-formidable');
const cors = require('cors');
const queryString = require('query-string');
const cookieParser = require('cookie-parser');
const Analytics = require('analytics-node');
const wildcard = require('wildcard');
const _ = require('lodash');
const roachr = require('./roachr');

let app = express();
let analytics = new Analytics(roachr.segmentKey);

const corsOptions = {
  origin: (origin, next) => {
    const whitelisted = _.some(roachr.whitelist, (w) => {
      let match = wildcard(w, origin);

      return match && match.length;
    });

    next(whitelisted ? null : 'Bad Request', whitelisted);
  }
};

app.use(formidable());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(function(req, res, next) {
  const origin = req.query && req.query.__amp_source_origin;

  const whitelisted = _.some(roachr.whitelist, (w) => {
    let match = wildcard(w, origin);

    return match && match.length;
  });

  if (!roachr.whitelist) {
    next('Bad Request', false);
    return;
  }

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
  res.header('Access-Control-Allow-Origin', origin);
  res.header('AMP-Access-Control-Allow-Source-Origin', origin);

  next();
});

app.post('/roachr', (req, res) => {
  console.log('getting a request?')
  const campaign = queryString.parse(req.get('Referrer').split('?')[1]);

  const anonymousId = req.cookies.AMP_ECID_GOOGLE || _.uniqueId()

  let traits = {
    email: req.fields.email
  };

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function(v) {
    if (campaign[v]) {
      traits[v] = campaign[v];
    }
  });

  analytics.identify({
    anonymousId,
    traits: traits,
    context: {
      campaign,
    }
  });

  console.log(`Anon user ${anonymousId} attempted to subscribe`);

  res.json({ subscribed: true });
});

const port = process.env.PORT;

app.listen(port);

console.log(`Manifold Waitlist API is running on port ${port}`);
