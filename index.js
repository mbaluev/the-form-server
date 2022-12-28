const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const passport = require("./passport");
const session = require("express-session")
const SQLiteStore = require("connect-sqlite3")(session);

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}

const app = express()

// parsers
app.use(bodyParser.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

// add the client URL to the CORS policy
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
app.use(session({
  store: new SQLiteStore({ db: 'the-form', dir: './db' }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())

// routes
const routerUser = require("./route/user");
const routerAuth = require("./route/auth");
app.get("/", function (req, res) {
  res.json({ success: true })
})
app.use('/api/user', routerUser);
app.use('/api/auth', routerAuth);

// start the server in port 8081
const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port

  console.log("App started at port:", port)
})
