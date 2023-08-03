function pageLoaded(src) {
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
    let container = document.getElementById("playersContainer");
}