const connectToMongo = require('./Database');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var cors = require('cors')
const app = express()
const port = 5000
const authentication = require('./routes/auth');

connectToMongo();

app.use(cors())
app.use(express.json());

app.use('/api/authentication',authentication);

app.get('/', async (req, res) => {
  res.send("hello world")
})

app.listen(port, () => {
  console.log(`Example app listening http://localhost:${port}`)
})