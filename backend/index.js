const express = require("express");
const app = express();
const PORT = 5000;
var cookieParser = require("cookie-parser");
var session = require("express-session");
const { MemoryStore } = require("express-session");

const cors = require("cors");
const bodyParser = require("body-parser");


app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "slot-mach-proj",
    store: new MemoryStore(),
    cookie: { secure: false }
  })
);

app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);

app.use(bodyParser());

const uuid = Math.floor(Math.random() * 11);

const user = {
  sessionID: uuid,
  credits: 10,
};

const fruits = {
  cherry: 10,
  lemon: 20,
  orange: 30,
  watermelon: 40,
};

app.get("/create_session", (req, res) => {
    req.session.user = user;
    req.session.save();
    res.send(req.session.user);
});

app.get("/roll", (req, res) => {
    let f = Object.keys(fruits);
    let response = [];

    for (var i = 0; i < 3; i++) {
      let r = Math.floor(Math.random() * 3);
    
      let data = {
        Fruit: f[r],
        Points: fruits[f[r]],
      };

      if(f[r] === "cherry"){
         data.sign = "C"
      } else if(f[r] === "orange"){
        data.sign = "O"
      } else if(f[r] === "lemon"){
        data.sign = "L"
      }else if(f[r] === "watermelon"){
        data.sign = "W"
      }

      response.push(data);
    }

    let win = response.every((val, i, arr)=> val.sign === arr[0].sign);
    console.log('Win:', win);
    if(!win){
      response.forEach((i)=>{
        i.Points = 0;
      });
    }else{
      response.forEach((i)=>{
        i.win = win;
      });
    }
    return res.send(response);
});

app.post("/credit", (req, res)=>{
  if(req.body){
    if(parseInt(req.body.totalCredits) <= 0){
      return res.send({totalCredits: 0});
    } else if(parseInt(req.body.totalCredits) >= 40){
      let chance = winPercentage(req.body.totalCredits);
      if(chance){
        return res.send(req.body);
      } 
      return res.send({totalCredits: 0, outOfLuck: true});
    }
    return res.send(req.body);
  } 
});

app.post("/cashout", (req, res)=>{
  if(req.body && req.session.user){
    req.session.user.acount = req.body.totalCredits;
    req.session.save();
    return res.send({transfered: true, msg: "Credit transfered."});
  }

  req.session.destroy();
  
  return res.send({transfered: true, msg: "Credit transfered."});

});

app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});

const winPercentage = (creditwins)=>{
 let chance = 0;
 let winChance = Math.floor(Math.random() * 100);
 let percentage = 0;

  if(creditwins >= 40 && creditwins <= 60){
    chance = 30;
  } else if(creditwins > 60){
    chance = 60;
  }

  percentage = Math.floor((winChance * 100) / new Date().getSeconds());
  wp = Math.floor((percentage * 100) / chance);

  console.log("Win chance: ", percentage);
  console.log("Win percentage: ", wp);
  
  if(wp >= percentage){
    console.log("You can roll!");
    return true;
  } else {
    console.log("Out of luck");
    return false;
  }
}


