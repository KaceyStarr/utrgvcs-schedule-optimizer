const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');


const PORT = 5000;


// Initialize the database
let db;
(async () => {
	db = await open({
		filename: './server/users.db',
		driver: sqlite3.Database
	});
})();


app.use(session({
  secret: 'UTRGV!!SCH3Dul3opt1!..',
  resave: false, 
  saveUninitialized: false, 
  cookie: { secure: false }
  }));


app.get('/api', (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});


app.get("/home", (req, res) => {
  return res.render("home")
});

app.post("/login", async (req, res) => {
  let errors = []
  let username = req.body.username;
  let password = req.body.password;
  // console.log("Username:", username, "Password:", password);

  // get the data from the databse
  const data = await db.get(`SELECT * FROM USERBASE WHERE username = ?`, [username])
  // console.log(data);

  if(!data){
    console.log("data not found in the database")
    errors.push("User data could not be found. Try making an account.")
    return res.render("home", {errors: errors})
  }
    // compare the encrypted password with the other password
    const compare = await bcrypt.compare(password, data.password)
  
    // if the comparison is true, send them to the dashboard
    if(compare){
      console.log("it worked")
      req.session.user = data;
      res.redirect("/dashboard")
    } 
    
    else {
      errors.push("Incorrect password. Try again.")
      return res.render("home", {errors: errors})
    }
  
});


app.post("/register", async (req, res)=>{
  let errors = [];
  let username = req.body.register_username;
  let password = req.body.register_password;
  let confirm = req.body.con_register_password;

  if(password != confirm){
    errors.push("passwords don't match!")
    return res.render("home", {errors: errors})
  } else {
    var data = await db.get(`SELECT * FROM USERBASE WHERE username = ?`, [username])
    if(data){
      errors.push("User already exists")
      return res.render("home", {errors: errors})
    }
    // console.log(username);
    // console.log(password);
    let hash = await bcrypt.hash(password, 10);
    const record = await db.run(`INSERT INTO USERBASE (username, password) VALUES (?, ?)`, [username, hash])
    var data = await db.get(`SELECT * FROM USERBASE WHERE username = ?`, [username])
    req.session.user = data;
    return res.redirect("/dashboard")
  }

})

app.get("/dashboard", (req, res) => {
  
  const user = req.session.user
  if(!user){
    return res.redirect("/home")
  }
  return res.render("dashboard", { username: user.username });
});


app.get("/logout", (req, res) => {
  delete req.session.user;
  return res.redirect("/home");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


