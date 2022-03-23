"use strict"

const resToGet = ["/res/m_sys_void_intro.ogg", "/res/m_sys_void_loop.ogg", "/res/m_sys_title_intro.ogg", "/res/m_sys_title_loop.ogg", "/res/m_bat_normal01_intro.ogg",
    "/res/m_bat_normal01_loop.ogg", "/res/m_bat_normal02_intro.ogg", "/res/m_bat_normal02_loop.ogg", "/res/g_ui_btn_n.ogg", "/res/g_ui_confirm.ogg", "/res/g_ui_item.ogg"]
const audioRes = []
const musicPlaying = []
let ws
let roomId




tryWS()
function tryWS() {
    try {
        ws = new WebSocket("wss://127.0.0.1:9454")
        ws.onopen = function () {
            console.log(`WS connection OK.`);
            document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[online]"
        };

        ws.onmessage = function (evt) {
            if (document.getElementById("loadingRoom")) { document.getElementById("loadingRoom").remove() }
            var received_msg = JSON.parse(evt.data);
            console.log(evt.data);
            switch (received_msg[0]) {
                case "gamelist":
                    document.querySelector("#existedGames").remove()
                    let existedGames = document.createElement("table")
                    existedGames.id = "existedGames"
                    let obj = document.createElement("tr")
                    obj.innerHTML = '<td class="borderBottom">房间名</td><td class="borderBottom">状态</td><td class="borderBottom">唯一识别码</td><td class="borderBottom">进入</td>'
                    existedGames.appendChild(obj)
                    let gameArr = received_msg[1]
                    for (let index = 0; index < gameArr.length; index++) {
                        const element = gameArr[index];
                        let line = document.createElement("tr")

                        let name = document.createElement("td")
                        let state = document.createElement("td")
                        let uuid = document.createElement("td")
                        let bnt = document.createElement("a")
                        name.innerHTML = element[0]
                        uuid.innerHTML = element[1]
                        for (let index2 = 2; index2 < element.length; index2++) {
                            const st = element[index2];
                            switch (st) {
                                case 0:
                                    state.innerHTML += "-"
                                    break;
                                case 1:
                                    state.innerHTML += "O"
                                    break
                                case 2:
                                    state.innerHTML += "√"
                                    break
                                default:
                                    break;
                            }

                        }
                        bnt.href = `javascript:selectGame('${element[1]}')`
                        bnt.innerHTML = "→"
                        line.append(name); line.append(state); line.append(uuid); line.append(bnt)
                        existedGames.append(line)

                    }
                    document.getElementById("existedGamesContainer").append(existedGames)
                    if (!document.getElementById("stateinfo")) {
                        let info = document.createElement("p")
                        info.id = "stateInfo"
                        info.innerHTML = "状态说明：三个字符依次为蓝方状态、红方状态和房间状态。“-”表示未开始，“O”表示已开始但缺席，“√”代表正常进行中"
                        document.getElementById("existedGamesContainer").append(info)
                    }

                    break;
                case "enterroom":
                    roomId = received_msg[1]
                    document.getElementById('chooseFaction').style.display = "block"
                    if (received_msg[2] != 2) { document.getElementById('chooseBlueBnt').style.display = "inline-block" }
                    if (received_msg[3] != 2) { document.getElementById('chooseRedBnt').style.display = "inline-block" }
                    break;
                case "entergame":
                    document.getElementById("pregame").style.display = "none"
                    document.getElementById("chooseFaction").style.display = "none"
                    break
                default:
                    break;
            }
        }

        ws.onclose = function () {
            document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[offline]"

        };

        ws.onerror = () => {
            document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[offline]"

            setTimeout(() => {
                console.log("WS connection error. Retry.");
                tryWS()
            }, 2000);
        }
    } catch (error) {
        setTimeout(() => {
            tryWS()
        }, 2000);
    }
}

class musicObj {
    constructor(src) {
        this.src = src
    }
    play(option, value) {
        let ado = document.createElement("audio")
        ado.src = this.src
        if (option == "switch") {
            ado.onended = () => audioRes[resToGet.indexOf(value)].play("loop")
        }
        if (option == "loop") {
            ado.loop = "loop"
        }
        musicPlaying.push(ado)
        ado.play()

    }
}

window.onload = () => {
    startLoad()
    document.querySelectorAll("button").forEach(element => {
        element.addEventListener("click", () => playAudio("/res/g_ui_confirm.ogg"))
    });
}

async function startLoad() {
    for (let index = 0; index < resToGet.length; index++) {
        const element = resToGet[index];
        await preload(element, index)
        setProgressBar(index + 1, resToGet.length, "progress")
    }
    document.querySelector("#loadBytes").innerHTML = `加载完成`
    document.querySelector("#loginBnt").style.display = "inline-block"
    audioRes[resToGet.indexOf("/res/m_sys_title_intro.ogg")].play("switch", "/res/m_sys_title_loop.ogg")
}

function preload(url, index) {
    return new Promise(function (resolve, reject) {
        localforage.getItem(url)
            .then(file => {
                let fileOK = function () {
                    let musicObj_ = new musicObj(URL.createObjectURL(file))
                    audioRes.push(musicObj_)
                    setProgressBar(100, 100, "progressSingle")
                    localforage.setItem(url, file).then(() => resolve())
                }
                if (!file) {
                    let xhr = new XMLHttpRequest()
                    xhr.responseType = "blob"
                    xhr.onprogress = oEvent => {
                        setProgressBar(oEvent.loaded, oEvent.total, "progressSingle")
                        document.querySelector("#loadBytes").innerHTML = `正在加载资源 共${index}/${resToGet.length}个 当前资源${Math.ceil(oEvent.loaded / 1024)}KB / ${Math.ceil(oEvent.total / 1024)}KB`
                    }
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            file = xhr.response
                            fileOK()
                        }

                    }
                    xhr.open("GET", url, true);
                    xhr.send();
                } else { fileOK() }
            })
    })
}

function playAudio(audio) {
    audioRes[resToGet.indexOf(audio)].play()
}

function setProgressBar(now, total, objId) {
    let progress = document.getElementById(objId)
    progress.ariaValueMax = Math.floor(total)
    progress.ariaValueNow = Math.floor(now)
    progress.style.width = String(Math.floor(now) / Math.floor(total) * 100 + "%")
}

function login() {
    document.getElementById("loginBnt").disabled = "disabled"
    musicPlaying.forEach(obj => obj.pause())
    document.querySelector("#loadDiv").style.display = "block"
    document.querySelector("#loadDiv").style.opacity = 0
    setTimeout(() => {
        document.querySelector("#loadDiv").style.display = "none"
        document.querySelector("#pregame").style.display = "block"
        setTimeout(() => {
            document.querySelector("#pregame").style.opacity = 1
        }, 10);
        audioRes[resToGet.indexOf("/res/m_sys_void_intro.ogg")].play("switch", "/res/m_sys_void_loop.ogg")
        ws.send(JSON.stringify(["getgames"]))
    }, 501);
    let refreshInterval = setInterval(() => {
        //ws.send(JSON.stringify(["getgames"]))

    }, 4000);
}

function selectGame(id) {
    console.log(id);
    ws.send(JSON.stringify(["gselect", id]))

}

function createGame() {
    let name = document.getElementById("gameNameToCreate").value
    if (name.length >= 4) {
        ws.send(JSON.stringify(["creategame", name]))
    } else { alert("需要至少4位数的房间名") }
}

function joinBlue() {
    ws.send(JSON.stringify(["genter", roomId, 0]))
}
function joinRed() {
    ws.send(JSON.stringify(["genter", roomId, 1]))
}

function htmlspecialchars(str) {
    str = str.replace(/&amp;/g, '&');
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");
    str = str.replace(/&#039;/g, "'");
    return str;
}