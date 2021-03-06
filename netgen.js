#!/usr/bin/env node

const fs = require("fs")

if(process.argv.length != 3){
  console.log("Please do:\n")
  console.log("./netgen.js your_file.json\n")
  process.exit()
}

function ipAndMask(_ip, _mask){
  ip = _ip.split(".")
  mask = _mask.split(".")
  return ((Number(ip[0]) & Number(mask[0])) + "." + (Number(ip[1]) & Number(mask[1])) + "." + (Number(ip[2]) & Number(mask[2])) + "." + (Number(ip[3]) & Number(mask[3])))
}

function invertMask(_mask){
  mask = _mask.split(".")
  return (Math.abs(Number(mask[0]) - 255) + "." + Math.abs(Number(mask[1]) - 255) + "." + Math.abs(Number(mask[2]) - 255) + "." + Math.abs(Number(mask[3]) - 255))
}

function ipAddOne(_ip){
  ip = _ip.split(".")
  return (Number(ip[0]) + "." + Number(ip[1]) + "." + Number(ip[2]) + "." + (Number(ip[3]) + 1))
}



let file = fs.readFileSync(process.argv[2])
let data = JSON.parse(file)

//console.log(data.version)

routers = []
clients = {}

// Add routers to routers array
for(let k in data){
  if(k != "version" && k != "clients"){
    routers.push(k)
  }
}

console.log(routers.length + " routers found : " + routers + "\n")

network = {}
vrfs = {}
bgp = {}
current_subnet = 100
current_vrf = 100
current_loop = 1

for (let i = 0; i < routers.length; i++) {

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){

    let inter = data[routers[i]].interfaces[g]

      let net_buff = null

      for(let k in network){

        if((network[k].includes(routers[i])) && (network[k].includes(inter.router))){
          net_buff = "192.168." + k + "." + (network[k].indexOf(routers[i]) + 1)
        }
      }

      if(net_buff == null){
        array_buff = []
        array_buff.push(routers[i])
        if(inter.router){
          array_buff.push(inter.router)
        }
        else{
          array_buff.push(inter.client)
          clients[routers[i]] = inter.client
        }
        network[current_subnet] = array_buff
        net_buff = "192.168." + current_subnet + ".1"
        current_subnet++
      }

      data[routers[i]].interfaces[g].ip = net_buff
      data[routers[i]].interfaces[g].mask = "255.255.255.0"

      //GENERATE VRFs FOR VPNs
      if(inter.vpn){
        let vrf_buff = false
        if(inter.vpn.name in vrfs){
          vrf_buff = true
        }
        if(vrf_buff == false){
          vrfs[inter.vpn.name] = current_vrf
          current_vrf++
        }
      }
  }

  // ADD LOOPBACK INTERFACE (NOT FOR CEs)
  if(!routers[i].includes("CE")){
    let last_elem = data[routers[i]].interfaces.length
    let buff = {}
    buff.ip = current_loop + "." + current_loop + "." + current_loop + "." + current_loop
    buff.mask = "255.255.255.255"
    buff.port = "Loopback0"
    data[routers[i]].interfaces[last_elem] = buff
    data[routers[i]].router_id = current_loop + "." + current_loop + "." + current_loop + "." + current_loop
    if(data[routers[i]].bgp){
      bgp[routers[i]] = buff.ip
    }
    current_loop++
  }

}

//For earch router generate config file
for (let i = 0; i < routers.length; i++) {


  //Creat text for conf file
  text = "!\n\n!\n"
  text += "version " + data.version + "\n"
  text += "service timestamps debug datetime msec\nservice timestamps log datetime msec\n!\n"
  text += "hostname " + routers[i] + "\n!\n"
  text += "boot-start-marker\nboot-end-marker\n!\n"
  text += "no aaa new-model\nip arp proxy disable\nno ip icmp rate-limit unreachable\nip cef\n!\n"

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    let inter = data[routers[i]].interfaces[g]
    if(inter.vpn){

      text += "ip vrf " + inter.vpn.name + "\n"
      text += " rd 10000:" + vrfs[inter.vpn.name] + "\n"

      // ADD OTHER PE'S VPN

      if(inter.vpn.route_targets_import){
        let link_list = inter.vpn.route_targets_import

        for(let h in link_list){
          text += " route-target import 10000:" + vrfs[link_list[h]] + "\n"
        }
      }

      if(inter.vpn.route_targets_export){
        let link_list = inter.vpn.route_targets_export

        for(let h in link_list){
          text += " route-target export 10000:" + vrfs[link_list[h]] + "\n"
        }
      }

      text += "!\n"

    }
  }



  text += "no ip domain lookup\nno ipv6 cef\n!\n!\n"

  test_mpls = false

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    if(data[routers[i]].interfaces[g].mpls == true){
      test_mpls = true
    }
  }
  if(test_mpls == true){
    text += "mpls label range " + ((i+1)*100) + " " + (((i+1)*100) + 99) + "\n"
    //text += "no mpls ldp advertise-labels\n"
    //text += "mpls ldp advertise-labels for 1\n"
    text += "multilink bundle-name authenticated\n!\n!\n"
  }
  text += "ip tcp synwait-time 5\n!\n!\n"

  let _interface = 1

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){

    let inter = data[routers[i]].interfaces[g]

    text += "interface " + inter.port + "\n"

    _interface++

    if(inter.vpn){
      text += " ip vrf forwarding " + inter.vpn.name + "\n"
    }

    text += " ip address " + inter.ip + " " + inter.mask + "\n"

    if(inter.access_list){
      text += " ip access-group " + inter.access_list.number + " out\n"
    }

    if(!inter.vpn){
      text += " negotiation auto\n"
    }
    else{
      text += " duplex full\n"
    }

    if(inter.mpls){
      text += " mpls ip\n"
    }
    text += "!\n"
  }

  //------------CONFIG OSPF FOR VPN
  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    let inter = data[routers[i]].interfaces[g]
    if(inter.vpn){
      text += "router ospf " + (g + 1)  + " vrf " + inter.vpn.name + "\n"
      text += " redistribute bgp 10000 subnets\n"
      text += " network " + ipAndMask(inter.ip, inter.mask) + " " + invertMask(inter.mask) + " area 0\n!\n"

    }
  }

  //-----------CONFIG GENERAL OSPF

  if(routers[i].includes("CE")){
    text += "router ospf 1\n"
    for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
      let inter = data[routers[i]].interfaces[g]
      if(inter.client){
        text += " passive-interface " + inter.port + "\n"
      }
    }
  }
  else{
    text += "router ospf 10000\n"
    text += " router-id " + data[routers[i]].router_id + "\n"
  }

  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    let inter = data[routers[i]].interfaces[g]
    if(!inter.vpn){
      text += " network " + ipAndMask(inter.ip, inter.mask) + " " + invertMask(inter.mask) + " area " + data[routers[i]].ospf_area + "\n"
    }
  }
  text += "!\n"

  //----------------CONFG BGP

  if(routers[i].includes("PE")){

    text += "router bgp 10000\n"
    text += " bgp log-neighbor-changes\n"
    for (let g in bgp){
      if(g != routers[i]){
        text += " neighbor " + bgp[g] + " remote-as 10000\n"
        text += " neighbor " + bgp[g] + " update-source Loopback0\n"
      }
    }
    text += "!\n"

    text += " address-family vpnv4\n"
    for (let g in bgp){
      if(g != routers[i]){
        text += "  neighbor " + bgp[g] + " activate\n"
        text += "  neighbor " + bgp[g] + " send-community extended\n"
        text += "  neighbor " + bgp[g] + " next-hop-self\n"
      }
    }
    text += " exit-address-family\n!\n"

    if(data[routers[i]].bgp){
      for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
        let inter = data[routers[i]].interfaces[g]
        if(inter.vpn){
          text += " address-family ipv4 vrf " + inter.vpn.name + "\n"
          text += "  redistribute ospf " + (g + 1) + "\n"
          text += " exit-address-family\n!\n"
        }
      }
    }

  }

  text += "ip forward-protocol nd\n!\n!\n"
  text += "no ip http server\n"
  text += "no ip http secure-server\n!\n!\n!\n!\n"


  for (let g = 0 ; g < data[routers[i]].interfaces.length ; g++){
    let inter = data[routers[i]].interfaces[g]
    if(inter.access_list){
      let allowed = inter.access_list.networks

      for(let h in allowed){

        if(data[allowed[h]]){
          for(let g = 0 ; g < data[allowed[h]].interfaces.length ; g++){
            let inter_network = data[allowed[h]].interfaces[g]
            if(inter_network.client){
              text += "access-list " + inter.access_list.number + " permit " + ipAndMask(inter_network.ip,inter_network.mask)+ " " + invertMask(inter_network.mask) + "\n"
            }
          }
        }
        else{

          let parent_client = null

          console.log(allowed)

          for(let g in clients){
            if(clients[g] == allowed[h]){
              parent_client = g
              console.log("found")
              break
            }
          }

          for(let g = 0 ; g < data[parent_client].interfaces.length ; g++){
            let inter_network = data[parent_client].interfaces[g]
            if(inter_network.client == allowed[h]){
              text += "access-list " + inter.access_list.number + " permit " + ipAndMask(inter_network.ip,inter_network.mask)+ " " + invertMask(inter_network.mask) + "\n"
            }
          }
        }



      }


    }

  }

  text += "!\n"


  text += "control-plane\n!\n!\n"


  text += "!\n"
  text += "line con 0\n exec-timeout 0 0\n privilege level 15\n logging synchronous\n stopbits 1\n"
  text += "!\n"
  text += "line aux 0\n exec-timeout 0 0\n privilege level 15\n logging synchronous\n stopbits 1\n"
  text += "!\n"
  text += "line vty 0 4\n login\n"


  text += "!\n!\nend\n"
  //Write text to conf file
  fs.writeFile(routers[i] + "_startup-config.cfg", text, function (err) {
  if (err) return console.log(err);
  });
}



for (let i in clients) {

  for (let k in data[i].interfaces){
    if(data[i].interfaces[k].client){
      text = "auto eth0\n"
      text += "iface eth0 inet static\n"
      text += "	address " + ipAddOne(data[i].interfaces[k].ip) + "\n"
      text += "	netmask " + data[i].interfaces[k].mask + "\n"
      text += "	gateway " + data[i].interfaces[k].ip + "\n"

      fs.writeFile(data[i].interfaces[k].client + "_interfaces", text, function (err) {
      if (err) return console.log(err);
      });
    }
  }
}
