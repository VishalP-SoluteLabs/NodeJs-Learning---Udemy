const path = require('path');

const express = require('express');

const Routes = require('./routes/index');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(Routes);

app.listen(3000);
