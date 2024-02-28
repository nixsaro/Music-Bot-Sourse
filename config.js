module.exports = {
TOKEN: "",
ownerID: ["947893366530637894"], 
botInvite: "", 
supportServer: "", 
mongodbURL: "",
status: '/help | /play',
commandsDir: './commands', 
language: "ru", 
embedColor: "cfcae3",
errorColor: "ff0000",
errorLog: "1085546657824907364", 


monitoring: {
status: false, 
url: "https://ayoka1.statuspage.io/", 
},

voteManager: { 
status: false, 
api_key: "", 
vote_commands: ["back","channel","clear","dj","filter","loop","nowplaying","pause","play","playlist","queue","resume","save","search","skip","stop","time","volume"],
vote_url: "",
},

shardManager:{
shardStatus: true 
},

playlistSettings:{
maxPlaylist: 10, 
maxMusic: 75, 
},

opt: {
voiceConfig: {
leaveOnFinish: true, 
leaveOnStop: true, 

leaveOnEmpty: { 
status: true, 
cooldown: 100000000, 
},

},

maxVol: 150, 

}
}
