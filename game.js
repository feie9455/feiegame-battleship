"use strict"

const resToGet = ["/res/m_sys_void_intro.ogg", "/res/m_sys_void_loop.ogg", "/res/m_sys_title_intro.ogg", "/res/m_sys_title_loop.ogg", "/res/m_bat_normal01_intro.ogg",
    "/res/m_bat_normal01_loop.ogg", "/res/m_bat_normal02_intro.ogg", "/res/m_bat_normal02_loop.ogg", "/res/g_ui_btn_n.ogg", "/res/g_ui_confirm.ogg", "/res/g_ui_item.ogg"]
const audioRes = []
const musicPlaying = []
let ws
let roomid




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
            console.log(`WS received ${received_msg}`);
            switch (received_msg[0]) {
                case "gamelist":
                    document.querySelector("#existedGames").remove()
                    let existedGames = document.createElement("table")
                    existedGames.id = "existedGames"
                    let gamesarr = received_msg.split("//")
                    gamesarr.shift()
                    let obj = document.createElement("tr")
                    let obj3 = document.createElement("td")
                    let obj4 = document.createElement("td")
                    let obj5 = document.createElement("td")
                    let obj6 = document.createElement("td")
                    obj3.innerHTML = "状态"
                    obj4.innerHTML = "唯一识别码"
                    obj5.innerHTML = "房间名"
                    obj6.innerHTML = "进入"
                    obj3.className = "borderbottom"
                    obj4.className = "borderbottom"
                    obj5.className = "borderbottom"
                    obj6.className = "borderbottom"
                    obj.appendChild(obj5)
                    obj.appendChild(obj3)
                    obj.appendChild(obj4)
                    obj.appendChild(obj6)
                    existedGames.appendChild(obj)
                    let gamearr=received_msg[1]
                    for (let index = 0; index < gamearr.length; index++) {
                        const element = gamearr[index];
                        let line=document.createElement("tr")
                        for (let index_ = 0; index_ < element.length; index_++) {
                            const element_ = element[index_];
                            let name = document.createElement("td")
                            let state = document.createElement("td")
                            let uuid = document.createElement("td")
                            let bnt = document.createElement("a")
                            
                        }
                    }
                    break;

                default:
                    break;
            }
            if (received_msg.slice(0, 5) == "games") {
                for (let index = 0; index < gamesarr.length - 1; index++) {
                    const element = gamesarr[index];
                    let origindata = htmlspecialchars(element)
                    let dataarr = origindata.split(":")
                    if (dataarr[2] == "running") {
                        let obj = document.createElement("tr")
                        let obj3 = document.createElement("td")
                        let obj4 = document.createElement("td")
                        let obj5 = document.createElement("td")
                        let obj6 = document.createElement("a")
                        obj3.className = "noborder"
                        obj4.className = "noborder"
                        obj5.className = "noborder"
                        obj3.style.width = "10%"
                        obj4.style.width = "50%"
                        obj5.style.width = "30%"
                        obj5.innerHTML = dataarr[1]
                        obj4.innerHTML = dataarr[0]
                        obj3.innerHTML = "⚪"
                        obj6.innerHTML = "→"
                        obj6.className = "noborder"
                        obj6.href = `javascript:enterGame(${index},${dataarr[0]})`
                        obj6.style.width = "10%"
                        obj.appendChild(obj5)
                        obj.appendChild(obj3)
                        obj.appendChild(obj4)
                        obj.appendChild(obj6)
                        existedGames.appendChild(obj)

                    }
                }
                document.querySelector("#existedGamesContainer").appendChild(existedGames)
            } else if (received_msg == "samename") {
                alert("房间名重复")
            }

        };

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
    startload()
    document.querySelectorAll("button").forEach(element => {
        element.addEventListener("click", () => playaudio("/res/g_ui_confirm.ogg"))
    });
}

async function startload() {
    for (let index = 0; index < resToGet.length; index++) {
        const element = resToGet[index];
        await preload(element, index)
        setProgressBar(index + 1, resToGet.length, "progress")
    }
    document.querySelector("#loadbytes").innerHTML = `加载完成`
    document.querySelector("#loginbnt").style.display = "inline-block"
    audioRes[resToGet.indexOf("/res/m_sys_title_intro.ogg")].play("switch", "/res/m_sys_title_loop.ogg")
}

function preload(url, index) {
    return new Promise(function (resolve, reject) {
        localforage.getItem(url)
            .then(file => {
                let fileOK = function () {
                    let mobj = new musicObj(URL.createObjectURL(file))
                    audioRes.push(mobj)
                    setProgressBar(100, 100, "progressSingle")
                    localforage.setItem(url, file).then(() => resolve())
                }
                if (!file) {
                    let xhr = new XMLHttpRequest()
                    xhr.responseType = "blob"
                    xhr.onprogress = oEvent => {
                        setProgressBar(oEvent.loaded, oEvent.total, "progressSingle")
                        document.querySelector("#loadbytes").innerHTML = `正在加载资源 共${index}/${resToGet.length}个 当前资源${Math.ceil(oEvent.loaded / 1024)}KB / ${Math.ceil(oEvent.total / 1024)}KB`
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

function playaudio(audio) {
    audioRes[resToGet.indexOf(audio)].play()
}

function setProgressBar(now, total, objid) {
    let progress = document.getElementById(objid)
    progress.ariaValueMax = Math.floor(total)
    progress.ariaValueNow = Math.floor(now)
    progress.style.width = String(Math.floor(now) / Math.floor(total) * 100 + "%")
}

function login() {
    document.getElementById("loginbnt").disabled = "disabled"
    musicPlaying.forEach(obj => obj.pause())
    document.querySelector("#loaddiv").style.display = "block"
    document.querySelector("#loaddiv").style.opacity = 0
    setTimeout(() => {
        document.querySelector("#loaddiv").style.display = "none"
        document.querySelector("#pregame").style.opacity = 1
        document.querySelector("#pregame").style.display = "block"
        audioRes[resToGet.indexOf("/res/m_sys_void_intro.ogg")].play("switch", "/res/m_sys_void_loop.ogg")
        ws.send(JSON.stringify(["getgames"]))
    }, 501);
    let refrushInterval = setInterval(() => {
        ws.send(JSON.stringify(["getgames"]))

    }, 4000);
}

function enterGame(num, id) {
    console.log(num);
    roomid = id
    ws.send(JSON.stringify(["genter"], num))

}

function createGame() {
    let name = document.getElementById("gameNameToCreate").value
    if (name.length >= 4) {
        ws.send(JSON.stringify(["creategame"], name))
    } else { alert("需要至少4位数的房间名") }
}

function htmlspecialchars(str) {
    str = str.replace(/&amp;/g, '&');
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");
    str = str.replace(/&#039;/g, "'");
    return str;
}