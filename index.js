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

// session
const session = require("express-session")
const SQLiteStore = require("connect-sqlite3")(session);
app.use(session({
  store: new SQLiteStore({ db: 'the-form', dir: './db' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, sameSite: 'none' }
}))

// passport
const passport = require("./passport");
app.use(passport.initialize())
app.use(passport.session())

// routes
const routerAuth = require("./route/auth");
const routerUser = require("./route/user");
const routerFile = require("./route/file");
const routerModule = require("./route/module");
const routerBlock = require("./route/block");
const routerMaterial = require("./route/material");
const routerTask = require("./route/task");
app.get("/", function (req, res) {
  res.json({ success: true })
})
app.use('/api/auth', routerAuth);
app.use('/api/user', routerUser);
app.use('/api/file', routerFile);
app.use('/api/module', routerModule);
app.use('/api/block', routerBlock);
app.use('/api/material', routerMaterial);
app.use('/api/task', routerTask);

// files
const fs = require('fs');
const dir = './files';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// start the server in port 8081
const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port

  console.log("App started at port:", port)
})
