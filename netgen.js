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

//console.log(routers.length + " routers found : " + routers)


//For earch router that we do
for (let i = 0; i < routers.length; i++) {

  console.log(data[routers[i]].interfaces[0])

  //Creat text for conf file
  text = "!\n\n!\n"
  text += "version " + data.version + "\n"
  text += "service timestamps debug datetime msec\nservice timestamps log datetime msec\n!\n"
  text += "hostname " + routers[i] + "\n!\n"
  text += "boot-start-marker\nboot-end-marker\n!\n"
  text += "no aaa new-model\nno ip icmp rate-limit unreachable\nip cef\n!\n"
  text += "no ip domain lookup\nno ipv6 cef\n!\n"

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    let inter = data[routers[i]].interfaces[g]
    text += "interface " + inter.name + "\n"
    text += " ip address " + inter.ip + " " + inter.mask + "\n"
    text += " negotiation auto\n!\n"
  }


  //Write text to conf file
  fs.writeFile(routers[i] + "_startup-config.cfg", text, function (err) {
  if (err) return console.log(err);
  });
}
