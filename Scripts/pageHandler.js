let iframe;
let iframeRef;

function pageLoaded(src) {
    iframe = document.getElementById("iframe");
    iframeRef = iframe.contentWindow;
    let href = src.href;
    let srcSplitted = href.split("/");
    let page = srcSplitted[srcSplitted.length - 1].split(".")[0];
    
    switch(page) {
        case "home":
            break;
        case "playerBrowser":
            showPlayers();

            break;
        default:
            console.error("unknown page loaded");
    }
}

function showPlayers() {
    let container = iframeRef.document.getElementById("playersContainer");

    // clear current list
    if(container.children.length > 0) {
        for(let i = 0; i < container.children.length; i++) {
            container.remove(container.children[i]);
        }
    }

    for(let i = 0; i < players.length; i++) {
        if(players[i].id != myId) {
            if(players[i].room == myRoom) {
                let elem = iframeRef.document.createElement("div");

                let text = iframeRef.document.createElement("p");
                text.innerText = players[i].name;
                elem.appendChild(text);

                container.appendChild(elem);
            }
        }
    }
}