const client = require('../../index.js')

client.on("ready", () => {
 
    const A= [
    {name: "github.com/sdeyy", type: "WATCHING"},
    {name: "EvilMC", type: "PLAYING"},
    {name: "evilmc.us", type: "COMPETING"},
    {name: "Young Miko", type: "LISTENING"},
    {name: "twitch", type: "STREAMING", URL: "https://twitch.tv/ImSdeyy"},
    ];
    
    setInterval(() => {
    let activ=A[Math.floor(Math.random() * A.length)]
   
    function presence(){
    client.user.setPresence( {
    activities:[activ],
    status: "online"
    })}
    
    presence()
    
    
    }, 5000);

    
   }
    
    )