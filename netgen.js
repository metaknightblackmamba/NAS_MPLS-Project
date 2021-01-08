#!/usr/bin/env node

const fs = require("fs")

let file = fs.readFileSync("norm.json")
let data = JSON.parse(file)

//console.log(data.version)

routers = []

// Add routers to routers array
for(let k in data){
  if(k != "version" ){
    routers.push(k)
  }
}

console.log(routers.length + " routers found : " + routers)



for (let i = 0; i < routers.length; i++) {

  //console.log(data[routers[i]])

  //Creat text for conf file
  text = "!\n\n!\n"
  text += "version " + data.version + "\n"

  //Write text to conf file
  fs.writeFile(routers[i] + "_startup-config.cfg", text, function (err) {
  if (err) return console.log(err);
  });
}
