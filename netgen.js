#!/usr/bin/env node

const fs = require("fs")

function ipAndMask(_ip, _mask){
  ip = _ip.split(".")
  mask = _mask.split(".")
  return ((Number(ip[0]) & Number(mask[0])) + "." + (Number(ip[1]) & Number(mask[1])) + "." + (Number(ip[2]) & Number(mask[2])) + "." + (Number(ip[3]) & Number(mask[3])))
}

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


//For earch router that we do
for (let i = 0; i < routers.length; i++) {

  //console.log(data[routers[i]].interfaces[0])

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
    text += " negotiation auto\n"
    if(data[routers[i]].mpls){
      text += " mpls ip\n"
    }
    text += "!\n"
  }

  if(data[routers[i]].ospf_area){
    text += "router ospf 10000\n"
    for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
      let inter = data[routers[i]].interfaces[g]
      text += " network " + ipAndMask(inter.ip, inter.mask) + "\n"
    }
    text += "!\n"
  }


  //Write text to conf file
  fs.writeFile(routers[i] + "_startup-config.cfg", text, function (err) {
  if (err) return console.log(err);
  });
}
