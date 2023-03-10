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
const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : []
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

// postgres
const init = require('./db/pg/utils/init');
init().then(() => console.log('Connected to the pg database'));
const store = require('./db/pg/utils/session');
const passport = require("./db/pg/passport");

// sqlite
// const store = require('./db/sqlite/utils/session');
// const passport = require("./db/sqlite/passport");

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

// main route
app.get("/", (req, res) => {
  res.json({ success: true })
})

// routes
const routerAuth = require("./db/pg/route/auth");
const routerUser = require("./db/pg/route/user");
const routerFile = require("./db/pg/route/file");
const routerModule = require("./db/pg/route/module");
const routerBlock = require("./db/pg/route/block");
const routerMaterial = require("./db/pg/route/material");
const routerTask = require("./db/pg/route/task");
const routerQuestion = require("./db/pg/route/question");
app.use('/api/auth', routerAuth);
app.use('/api/user', routerUser);
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
  const port = server.address().port

  console.log("App started at port:", port)
})
