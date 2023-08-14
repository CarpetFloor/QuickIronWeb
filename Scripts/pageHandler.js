let iframe;
let iframeRef;
let updatePlayerBrowserInterval;
let updatePlayerBrowserIntervalActive = false;
let updateChallengesInterval;
let updateChallengesIntervalActive = false;

function pageLoaded(src) {
    iframe = document.getElementById("iframe");
    iframeRef = iframe.contentWindow;
    let href = src.href;
    let srcSplitted = href.split("/");
    let page = srcSplitted[srcSplitted.length - 1].split(".")[0];
    
    document.body.style.backgroundColor = "#C8AE7D";
    iframeRef.document.body.style.backgroundColor = "#C8AE7D";

    switch(page) {
        case "home":
            break;
        case "playerBrowser":
            if(!(multiplayer)) {
                showPlayers();
            }

            break;
        case "challenges":
            if(!(multiplayer)) {
                showChallenges();
            }

            break;
        case "practice":
            document.body.style.backgroundColor = "black";
            iframeRef.document.body.style.backgroundColor = "black";

            iframeRef.document.getElementById("practiceMainMenuButton").style.position = "absolute";
            iframeRef.document.getElementById("practiceMainMenuButton").style.display = "none";
            iframeRef.document.getElementById("practiceMainMenuButton").style.left = "50%";
            iframeRef.document.getElementById("practiceMainMenuButton").style.marginTop = "75px";
            iframeRef.document.getElementById("practiceMainMenuButton").style.transform = "translate(-50%, 0)";
            
            startPractice();

            break;
        case "duel":
            document.body.style.backgroundColor = "black";
            iframeRef.document.body.style.backgroundColor = "black";

            iframeRef.document.getElementById("duelMainMenuButton").style.position = "absolute";
            iframeRef.document.getElementById("duelMainMenuButton").style.display = "none";
            iframeRef.document.getElementById("duelMainMenuButton").style.left = "50%";
            iframeRef.document.getElementById("duelMainMenuButton").style.marginTop = "75px";
            iframeRef.document.getElementById("duelMainMenuButton").style.transform = "translate(-50%, 0)";

            startDuel();

            break;
        default:
            console.error("unknown page loaded");
    }
}

function showPlayers() {
    if(!(multiplayer)) {
        if(!(updatePlayerBrowserIntervalActive)) {
            updatePlayerBrowserIntervalActive = true;

            updatePlayerBrowserInterval = window.setInterval(showPlayers, 1000);
        }

        let container = iframeRef.document.getElementById("playersContainer");
        
        // clear current list
        container.innerHTML = "";

        // add players
        for(let i = 0; i < players.length; i++) {
            if(players[i].id != myId) {
                if(players[i].room == myRoom) {
                    let elem = iframeRef.document.createElement("div");

                    let button = iframeRef.document.createElement("button");
                    button.innerText = "Challenge";
                    elem.appendChild(button);
                    
                    let text = iframeRef.document.createElement("p");
                    text.innerText = players[i].name;
                    elem.appendChild(text);
                    
                    container.appendChild(elem);

                    button.onclick = function(){
                        let name = button.parentNode.children[1].innerText;

                        socket.emit("challenge", name);
                        
                        iframeRef.document.getElementById("challengedNotice").innerText = name + " challenged!";

                        iframeRef.document.getElementById("challengedNotice").style.opacity = 1;

                        window.setTimeout(function(){
                            iframeRef.document.getElementById("challengedNotice").style.opacity = 0;
                        }, 2000);
                    };
                }
            }
        }
    }
}

function showChallenges() {
    if(!(multiplayer)) {
        if(!(updateChallengesIntervalActive)) {
            updateChallengesIntervalActive = true;

            updateChallengesInterval = window.setInterval(showChallenges, 1000);
        }

        let container = iframeRef.document.getElementById("playersContainer");
        
        // clear current list
        container.innerHTML = "";

        // add players
        for(let i = 0; i < challenges.length; i++) {
            if(challenges[i].includes(myId)) {
                // only show challenges in which the client was challenged
                if(challenges[i][1] == myId) {
                    let elem = iframeRef.document.createElement("div");

                    let button = iframeRef.document.createElement("button");
                    button.innerText = "Accept";
                    elem.appendChild(button);
                    
                    let text = iframeRef.document.createElement("p");
                    text.innerText = getName(challenges[i][1]);
                    elem.appendChild(text);
                    
                    container.appendChild(elem);
                    
                    button.onclick = function() {
                        socket.emit("startDuel", challenges[i]);
                    }
                }
            }
        }
    }
}

function getName(id) {
    for(let i = 0; i < players.length; i++) {
        if(players[i].id == id) {
            return players[i].name;
        }
    }
}