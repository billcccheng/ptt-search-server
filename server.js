let express = require("express");
let app = express()
let fs = require("fs");
let promise = require("promise");
let objectValues = require("object-values");

let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);

app.get('/api', (req, res) => {
  console.log(req.query.inputs.split(","));
  let params = req.query.inputs.split(",");

  let dataObj = getDataHits(params); 

  res.setHeader('Content-Type', 'application/json');
  res.sendStatus(200);
  //res.json(response);
});


function getDataHits(queries){
  let dataHits = [];
  for(let i = 0; i < 60; i++){
    let file = fs.readFileSync(__dirname + "/data/data-" + i + ".json", "utf-8");
    file = JSON.parse(file);
    file.forEach(dataObj => {
      data = objectValues(dataObj);
      data = data.toString().toLowerCase();
      let hit = queries.every( query => data.includes(query.toLowerCase()));
      if(hit)
        console.log(dataObj.link);
    })
  }
  console.log("FINISHED");
}

let server = app.listen(process.env.PORT||8080, function(){
  let port = server.address().port;
  console.log("App running on port %s ",port);
});



