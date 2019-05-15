const express = require("express");
const app = express();
const port = 80;
app.use(function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static("./"));

app.listen(port, function appStarted() {
    console.log(`App listening on port ${port}!`);
});
