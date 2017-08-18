# Oh my api!
This tiny library helps build simple API in minutes. It provides an abstract layer on top of existing popular web frameworks in Nodejs world such as ExpressJS

# Getting started
## Install
```
npm install ohmyapi express validate.js
```

`express` is the default web engine
`validate.js` is the default validator

## Example
```javascript
const ohmyapi = require('ohmyapi');

app = ohmyapi(`${__dirname}/routes/api`)
  .engine('express', {
    prefix: '/api'
  })
  .authenticate((args, ctx) => {
    // do authentication here
  })
  .authorize({
    isAdmin(args, ctx) {
      // do authorization here
      return ctx.user && ctx.user.isAdmin;
    }
  })
  .init();
```

# TODO
- Write better documentation...
- Support more web frameworks
- Support more data validation libraries