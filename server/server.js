const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
const mongoose = require("mongoose");
const Register = require("./models/RegisterModel");
const { getMultipleDataFetch } = require("./helpers/FetchFunctions");
const { transformDataToListObject } = require("./helpers/utilFunctions");
const path = require("path");
const fs = require("fs");

const app = express();
mongoose.connect("mongodb://root:root@localhost:27017/coviddb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.static("./build"));
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "connected to server" });
});

app.post("/register", (req, res) => {
  const { date, country, province, confirmed, deaths } = req.body;
  const id = date + country;

  const register = new Register({
    _id: id,
    date: date,
    country: country,
    province: province,
    confirmed: confirmed,
    deaths: deaths,
  });
  register.save((err, result) => {
    if (err) return console.log(err);
    res.status(200).json({ data: result });
  });
});

app.get("/registers", (req, res) => {
  //console.log("service has been requested");
  Register.find((err, result) => {
    if (err) return console.log(err);

    /*  try {
      fs.writeFile("coviddata.json", JSON.stringify({ data: result }));
    } catch (err) {
      console.log(err);
    } */

    res.status(200).json({ data: result });
  });
});

app.post("/registers", (req, res) => {
  const retrievedArray = req.body;
  const registerArray = retrievedArray.map((register) => {
    return {
      ...register,
      _id: register.date + register.country + register.province,
    };
  });
  Register.insertMany(registerArray, (err, result) => {
    if (err) return console.log(err);
    res.status(200).json({ data: result });
  });
});

app.get("/registersfromsource", (req, res) => {
  getMultipleDataFetch("2020-05-22", "2020-06-08")
    .then((sourceDataArray) => {
      // console.log(sourceDataObject);
      const retrievedListObject = transformDataToListObject(sourceDataArray);
      //console.log(retrievedArray);
      const registerArray = Object.values(retrievedListObject);
      //console.log(registerArray);
      Register.insertMany(registerArray, (err, result) => {
        if (err) return Promise.reject(err);
        res.status(200).json({ data: result });
      });
    })
    .catch((err) => res.status(403).json({ message: err }));
});

app.listen(PORT, () => {
  console.log("listening on port: " + PORT);
});
