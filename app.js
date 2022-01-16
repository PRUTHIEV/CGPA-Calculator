/* Importing the necessary JS BuiltIn Modules */
const express = require("express");
const morgan = require("morgan");
const bp = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require("dotenv");

/* Importing the custom database file that contains the mongodb schema*/
const db = require("./database");

/*Creating the file from which I can access the environmental variables */
dotenv.config({ path: "./config.env" });

/* Connecting to the mongodb database */
const DB = process.env.DATABASE_CONNECTION;
mongoose
  .connect(DB, { useNewUrlParser: true })
  .then((val) => console.log("The database is susccessfully connected"))
  .catch((err) => {
    console.log("Some error occured ..." + err);
  });

/* Using necessary middlewares */
app.use(morgan("dev")); // To console log all the http methods and urls
app.use(bp.urlencoded({ extended: true })); // To read from the data passed fromt the client(front end)

/*Setting the view engine to be Express Javascript */
app.set("view engine", "ejs");

/*Creating a session to store the cookies */
app.use(
  session({
    secret: "My secret Message",
    resave: false,
    saveUninitialized: false,
  })
);

/*Creating and initializing the session and cookies*/
app.use(passport.initialize());
app.use(passport.session());
passport.use(db.createStrategy());
passport.serializeUser(db.serializeUser());
passport.deserializeUser(db.deserializeUser());

/* Rendering that css files are stored in public folder */
app.use(express.static("public"));

/*Global Variables */
var numberOfSubjects = 0;
var numberOfSemester = 0;
var creditsArray = [];
var gradeArray = [];
var totalCreaditsArray = [];
var totalGPA = [];
var setCGPA = false;
var gpa = 0.0;
var cgpa = 0.0;
var isLoggedOut = false;
/* Helper Function */

/* To get the points according to the entered Grade */
function getPoints(grade) {
  switch (grade) {
    case "O":
      return 10;
    case "A+":
      return 9;
    case "A":
      return 8;
    case "B+":
      return 7;
    case "B":
      return 6;
    default:
      console.log("Incorrect Credits Something went wrong !!!");
      return 1;
  }
}

/*Find the total points */
function getTotalPoints() {
  let totalPoints = 0;
  for (let i = 0; i < creditsArray.length; i++) {
    totalPoints += creditsArray[i] * gradeArray[i];
  }
  return totalPoints;
}

/*Find the sum of all the credits entered */
function getSumPoints() {
  let sumPoints = 0;
  for (let i = 0; i < creditsArray.length; i++) {
    sumPoints += creditsArray[i];
  }
  return sumPoints;
}

/*Finding the GPA */
function getGPA() {
  setCGPA = true;
  return getTotalPoints() / getSumPoints();
}

/* To read ans convert the credits to number */
function readCredits(req) {
  let credits = [];
  for (let i = 0; i < numberOfSubjects; i++) {
    const reqBody = req.body;
    const param = "subject-" + i + "-credits";
    credits.push(reqBody[param] * 1);
  }
  return credits;
}

/*To read the grades*/
function readGrades(req) {
  let grades = [];
  for (let i = 0; i < numberOfSubjects; i++) {
    const reqBody = req.body;
    const param = "subject-" + i + "-grade";
    grades.push(getPoints(reqBody[param]));
  }
  return grades;
}

/*Read all the total creadits enterd in cgpa page */
function readTotalCredits(req) {
  for (let i = 0; i < numberOfSemester; i++) {
    const name = "credits-" + i;
    totalCreaditsArray.push(req.body[name] * 1);
  }
  return totalCreaditsArray;
}

/*Read all the GPA's entered in cgpa page */
function readGPA(req) {
  for (let i = 0; i < numberOfSemester; i++) {
    const name = "gpa-" + i;
    totalGPA.push(req.body[name] * 1);
  }
  return totalGPA;
}

/*Return the total credits for cgpa page */
function getTotalCredits(totalCreaditsArray) {
  let sum = 0;
  for (let i = 0; i < numberOfSemester; i++) {
    sum += totalCreaditsArray[i];
  }
  return sum;
}

/*Return the totalGPA in cgpa page */
function getTotalGPA(totalCreaditsArray, totalGPA) {
  let totalCredits = 0;
  for (let i = 0; i < numberOfSemester; i++) {
    totalCredits += totalCreaditsArray[i] * totalGPA[i];
  }
  return totalCredits;
}
/**********************************************  GET REQUEST HANDLE   *********************************************** */

/* GET HTTP - Home */
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    console.log("The username is :" + req.user);
    res.render("home", {
      homePage: "body-home",
      styleFileName: "HomeStyle.css",
      welcomeUser: req.user.name,
      auth: "Logout",
    });
  } else {
    if (isLoggedOut) {
      isLoggedOut = false;
      res.render("home", {
        homePage: "body-home",
        styleFileName: "HomeStyle.css",
        auth: "LogIn",
        logOutMessage: "Logged Out Successfully",
      });
    } else {
      res.render("home", {
        homePage: "body-home",
        styleFileName: "HomeStyle.css",
        auth: "LogIn",
      });
    }
  }
});

/*GET HTTP - Login */
app.get("/login", function (req, res) {
  res.render("login");
});

/*GET HTTP - gpa 
Render the page only if the user is logged in or his/her cookie is stored else redirect to the login page */
app.get("/gpa", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("gpa", {
      homePage: "body-gpa",
      styleFileName: "GpaStyle.css",
      auth: "LogOut",
      numberOfSubjects: 0,
      setCGPA: false,
      gpa: 0.0,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/cgpa", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("cgpa", {
      homePage: "body-gpa",
      styleFileName: "CgpaStyle.css",
      auth: "LogOut",
      numberOfSemesters: 0,
      setCGPA: false,
      cgpa: 0.0,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/myGPA", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("myGPAs", {
      homePage: "body-home",
      styleFileName: "myGPAs.css",
      auth: "LogOut",
      name: req.user.name,
      regNo: req.user.username,
      marks: req.user.marks,
    });
  } else {
    res.redirect("login");
  }
});

app.get("/myCGPA", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("myCGPAs", {
      homePage: "body-home",
      styleFileName: "myGPAs.css",
      auth: "LogOut",
      marks: req.user.CGPA,
    });
  } else {
    res.redirect("login");
  }
});

/*Loging Users Out */
app.get("/logout", function (req, res) {
  req.logOut();
  isLoggedOut = true;
  res.redirect("/");
});

/**********************************************  POST REQUEST HANDLE   *********************************************** */

/*POST HTTP - Register 
SignUp Using Passport Module  */
app.post("/register", function (req, res) {
  console.log(req.body);
  const name = req.body.name;
  const email = req.body.email;
  const registerNumber = req.body.username;
  const password = req.body.password;
  db.register(
    new db({
      name: name,
      username: registerNumber,
      email: email,
    }),
    password,
    function (err, user) {
      if (err) {
        console.log("Error occured in registering the users " + err);
        return res.render("login", { error: "User Already Exists ..." });
      } else {
        passport.authenticate("local")(req, res, function () {
          return res.redirect("/");
        });
      }
    }
  );
});

/*POST HTTP - Login */
app.post("/login", function (req, res, next) {
  const user = new db({
    username: req.body.username,
    password: req.body.password,
  });
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", {
        error: "Incorrect Username or password ...",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

/*POST HTTP - GPA */
app.post("/gpa", function (req, res) {
  console.log("gpas");
  console.log(req);
  if ("subjectCount" in req.body) {
    numberOfSubjects = req.body.subjects;
    console.log("The number of subjects is :" + numberOfSubjects);
    console.log(req.body);
    setCGPA = false;
    creditsArray = [];
    gradeArray = [];
    gpa = 0.0;
    return res.render("gpa", {
      homePage: "body-gpa",
      styleFileName: "GpaStyle.css",
      auth: "LogOut",
      numberOfSubjects: numberOfSubjects,
      setCGPA: false,
      gpa: 0.0,
    });
  } else if ("saveName" in req.body) {
    console.log("The name is saved ....");
    console.log(req.body);
    console.log(gpa);
    const arr = { name: req.body.saveName, gpa: gpa };
    db.find({ username: req.user.username })
      .then((user) => {
        console.log(user);
        console.log(user[0].marks);
        if (user[0].marks.length == 0) {
          db.findOneAndUpdate(
            { username: req.user.username },
            { $push: { marks: arr } }
          )
            .then((val) => {
              console.log("Successs");
            })
            .catch((err) => {
              console.log("error" + err);
              return res.redirect("/");
            });
        } else {
          const u = user[0].marks.find((m) => {
            return m.name === arr.name;
          });
          console.log("U :" + u);
          if (typeof u === "undefined") {
            db.findOneAndUpdate(
              { username: req.user.username },
              { $push: { marks: arr } }
            )
              .then((val) => {
                console.log("Successs");
                console.log("saved");
                return res.redirect("/myGPA");
              })
              .catch((err) => {
                console.log("error" + err);
                return res.redirect("/");
              });
          } else {
            console.log("Name already exists !!! ");
            return res.render("gpa", {
              homePage: "body-gpa",
              styleFileName: "GpaStyle.css",
              auth: "LogOut",
              numberOfSubjects: numberOfSubjects,
              setCGPA: setCGPA,
              gpa: gpa,
              error: "Name already exists , give a different name ",
            });
          }
        }
      })
      .catch((err) => {
        console.log("Error occured :" + err);
      });
  } else {
    console.log("Req body is :");
    console.log(req.body);
    console.log("This for calculation");
    console.log(req.body);
    creditsArray = readCredits(req);
    gradeArray = readGrades(req);
    console.log(creditsArray, gradeArray);
    gpa = getGPA();
    return res.render("gpa", {
      homePage: "body-gpa",
      styleFileName: "GpaStyle.css",
      auth: "LogOut",
      numberOfSubjects: numberOfSubjects,
      setCGPA: true,
      creditsArray: creditsArray,
      gradesArray: gradeArray,
      gpa: gpa.toFixed(2),
    });
  }
});

/*POST HTTP - Cgpa */
app.post("/cgpa", function (req, res) {
  if ("subjectCount" in req.body) {
    numberOfSemester = req.body.semesters;
    console.log("The number of subjects is :" + numberOfSubjects);
    console.log(req.body);
    setCGPA = false;
    creditsArray = [];
    gradeArray = [];
    gpa = 0.0;
    return res.render("cgpa", {
      homePage: "body-gpa",
      styleFileName: "CgpaStyle.css",
      auth: "LogOut",
      numberOfSemesters: numberOfSemester,
      setCGPA: false,
      cgpa: 0.0,
    });
  } else if ("saveName" in req.body) {
    console.log("The name is saved ....");
    console.log(req.body);
    console.log(gpa);
    const arr = { name: req.body.saveName, cgpa: cgpa };
    db.find({ username: req.user.username })
      .then((user) => {
        console.log(user);
        console.log(user[0].CGPA);
        if (user[0].CGPA.length == 0) {
          db.findOneAndUpdate(
            { username: req.user.username },
            { $push: { CGPA: arr } }
          )
            .then((val) => {
              console.log("Successs");
            })
            .catch((err) => {
              console.log("error" + err);
              return res.redirect("/");
            });
        } else {
          const u = user[0].CGPA.find((m) => {
            return m.name === arr.name;
          });
          console.log("U :" + u);
          if (typeof u === "undefined") {
            db.findOneAndUpdate(
              { username: req.user.username },
              { $push: { CGPA: arr } }
            )
              .then((val) => {
                console.log("Successs now redirecting ....");
                return res.redirect("/myCGPA");
              })
              .catch((err) => {
                console.log("error" + err);
                return res.redirect("/");
              });
          } else {
            console.log("Name already exists !!! ");
            return res.render("cgpa", {
              homePage: "body-gpa",
              styleFileName: "CgpaStyle.css",
              auth: "LogOut",
              numberOfSemester: numberOfSemester,
              setCGPA: setCGPA,
              cgpa: cgpa.toFixed(2),
              error: "Name already exists , give a different name ",
            });
          }
        }
      })
      .catch((err) => {
        console.log("Error occured :" + err);
      });
  } else {
    console.log("Req body is :");
    console.log(req.body);
    console.log("This for calculation");
    totalCreaditsArray = readTotalCredits(req);
    totalGPA = readGPA(req);
    console.log(totalCreaditsArray, totalGPA);
    cgpa =
      getTotalGPA(totalCreaditsArray, totalGPA) /
      getTotalCredits(totalCreaditsArray);
    console.log("The cgpa is :" + cgpa);
    setCGPA = true;
    return res.render("cgpa", {
      homePage: "body-gpa",
      styleFileName: "CgpaStyle.css",
      auth: "LogOut",
      numberOfSemesters: numberOfSemester,
      setCGPA: true,
      totalCreditsArray: totalCreaditsArray,
      totalGPA: totalGPA,
      cgpa: cgpa.toFixed(2),
    });
  }
});

app.get("*", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("error", { isLoginned: false });
  } else {
    res.render("error", { isLoginned: true });
  }
  res.render("error");
});
/*********************************** Starting the server and bind to port 3000 *******************************/

app.listen(process.env.PORT || 3000, function () {
  console.log("The server is started and listening at port 3000 ...");
});
