const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }))
const publicPath = path.join(__dirname);
app.get('/demo1.html', (req, res) => res.sendFile(path.join(publicPath, 'demo1.html')));


app.post('/submit', (req, res) => {
    const {name,email,password}=req.body;
    console.log({name,email,password});
    res.send(`${name},${email},${password}`); 
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));