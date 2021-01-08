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

console.log(routers.length + " routers found !")

for (let i = 0; i < routers.length; i++) {
  console.log(data[routers[i]])
}
