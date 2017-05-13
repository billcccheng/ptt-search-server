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
  let boardName = req.query.board;
  let params = req.query.inputs.split(",");
  let response = getDataHits(boardName, params); 

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
});


function isDuplicate(firstTimeData, link){
  if(firstTimeData.has(link)){
    return true;
  }
  firstTimeData.add(link);
  return false;
}

function getDataHits(boardName, queries){
  let contentHitsObject = {};
  let firstTimeData = new Set();
  for(let i = 0; i < 60; i++){
    let file = fs.readFileSync(__dirname + "/" + boardName + "/data-" + i + ".json", "utf-8");
    file = JSON.parse(file);
    file.forEach(dataObj => {
      let dataObjValue = objectValues(dataObj).toString().toLowerCase();
      let hit = queries.every( query => dataObjValue.includes(query.toLowerCase()));
      if(hit && !isDuplicate(firstTimeData, dataObj.link)){
        let date = dataObj.日期.split(" ");
        let year = date[date.length - 1];
        if(/^\d+$/.test(year)){
          if(!(year in contentHitsObject)){
            contentHitsObject[year] = [];
          }
          let contentHit = {};
          contentHit.title = dataObj.標題;
          contentHit.link = dataObj.link;
          contentHitsObject[year].push(contentHit);
        }
      }
    })
  }
  return contentHitsObject;
}

let server = app.listen(process.env.PORT||8081, function(){
  let port = server.address().port;
  console.log("App running on port %s ",port);
});



