const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Works');
});

app.listen(3000);