// express
const express = require("express")
const app = express()

// .env
if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}

// parsers
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
app.use(bodyParser.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

// add the client URL to the CORS policy
const cors = require("cors")
const whitelist = process.env.WHITELIST_DOMAINS.split(",");
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

// prisma
const store = require('./utils/session');
const passport = require("./passport");

// session
const session = require("express-session");
app.use(session({
  store,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { secure: true, sameSite: 'none' }
}))

// passport
app.use(passport.initialize())
app.use(passport.session())

// favicon
const favicon = require('serve-favicon');
const path = require('path');
app.use(favicon(path.join(__dirname, 'public', 'favicon', 'favicon.ico')));

// main route
app.get("/", (req, res) => {
  res.json({
    success: true,
    v: '1.1',
    whitelist: process.env.WHITELIST_DOMAINS,
    whitelistArr: process.env.WHITELIST_DOMAINS.split(","),
  })
})

// old routes
const routerAuth = require("./router/auth");
const routerUser = require("./router/user");
const routerDocumentType = require("./router/documentType");
const routerFile = require("./router/file");
const routerModule = require("./router/module");
const routerBlock = require("./router/block");
const routerMaterial = require("./router/material");
const routerTask = require("./router/task");
const routerQuestion = require("./router/question");
app.use('/api/auth', routerAuth);
app.use('/api/user', routerUser);
app.use('/api/documentType', routerDocumentType);
app.use('/api/file', routerFile);
app.use('/api/module', routerModule);
app.use('/api/block', routerBlock);
app.use('/api/material', routerMaterial);
app.use('/api/task', routerTask);
app.use('/api/question', routerQuestion);

// files
const fs = require('fs');
const dir = './files';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// start the server in port 8081
const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port;
  console.log("App started at port:", port);
})
