"use strict"

const resToGet = ["/res/m_sys_void_intro.ogg", "/res/m_sys_void_loop.ogg", "/res/m_sys_title_intro.ogg", "/res/m_sys_title_loop.ogg", "/res/m_bat_normal01_intro.ogg",
    "/res/m_bat_normal01_loop.ogg", "/res/m_bat_normal02_intro.ogg", "/res/m_bat_normal02_loop.ogg", "/res/g_ui_btn_n.ogg", "/res/g_ui_confirm.ogg", "/res/g_ui_item.ogg", "/res/b_ui_mark.ogg", "/res/b_ui_alarmenter.ogg", "/res/b_ui_win.ogg", "/res/m_bat_failed_loop.ogg", "/res/m_bat_failed_intro_voice.ogg", "/res/m_bat_victory_loop.ogg", "/res/m_bat_victory_intro.ogg"]
const audioRes = []
const musicPlaying = []
let ws
let roomId
let factionNow
let refreshInterval
let gameended = false
let roomToTag = {}

function tryWS() {
    return new Promise(function (resolve, reject) {
        document.getElementById("WSLoadDiv").style.display = "block"
        try {
            if (!WebSocket) {
                alert("您的浏览器不支持Websocket，请升级您的浏览器。")
            }
            ws = new WebSocket("wss://127.0.0.1:9454")
            ws.onopen = function () {
                document.getElementById("WSLoadDiv").style.display = "none"
                console.log(`WS connection OK.`);
                document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[online]"
            };

            ws.onmessage = function (evt) {
                var received_msg = JSON.parse(evt.data);
                console.log(evt.data);
                switch (received_msg[0]) {
                    case "gamelist":
                        let table = document.createElement("table")
                        table.id = "existedGames";
                        table.innerHTML += ("<tr><td>房间名</td><td>唯一识别码</td><td>蓝方状态</td><td>红方状态</td><td>房间状态</td><td>所选合约</td><td>加入</td></tr>")
                        for (let index = 0; index < received_msg[1].length; index++) {
                            const lineData = received_msg[1][index];
                            let line = document.createElement("tr")
                            for (const key in lineData) {
                                if (Object.hasOwnProperty.call(lineData, key)) {
                                    const element = lineData[key];
                                    let block = document.createElement("td")
                                    if (key == "tags") {
                                        block.innerHTML = `<a href="javascript:viewRoomInfo('${lineData["id"]}')">查看合约</a>`
                                        roomToTag[lineData["id"]] = element
                                    } else {
                                        block.innerHTML = htmlspecialchars(element)
                                    }
                                    line.appendChild(block)
                                }
                            }
                            line.innerHTML += `<td><a href='javascript:selectGame("${lineData["id"]}")'>→</a></td>`
                            table.appendChild(line)
                        }
                        document.getElementById("existedGames").remove()
                        document.getElementById("existedGamesContainer").appendChild(table)
                        break;
                    case "enterroom":
                        roomId = received_msg[1]
                        document.getElementById('chooseFaction').style.display = "block"
                        if (received_msg[2] != 2) { document.getElementById('chooseBlueBnt').style.display = "inline-block" }
                        if (received_msg[3] != 2) { document.getElementById('chooseRedBnt').style.display = "inline-block" }
                        break;
                    case "entergame":
                        clearInterval(refreshInterval)
                        document.getElementById("pregame").style.opacity = 0
                        document.getElementById("chooseFaction").style.opacity = 0
                        if (received_msg[3][0] != 0) {
                            gameStarted = true
                        }
                        setTimeout(() => {
                            musicPlaying.forEach(obj => obj.pause())
                            const num2State = num => {
                                switch (num) {
                                    case 0:
                                        return "未初始化"
                                        break;
                                    case 1:
                                        return "离开"
                                        break;
                                    case 2:
                                        return "在线"
                                        break;
                                    default:
                                        break;
                                }
                            }
                            document.getElementById("blueStateDiv").innerHTML = num2State(received_msg[1])
                            document.getElementById("redStateDiv").innerHTML = num2State(received_msg[2])
                            if (received_msg[3][0] == 0) {
                                document.getElementById("turnInfoDiv").innerHTML = `第${received_msg[3][0]}回合，请放置`
                            } else {
                                document.getElementById("turnInfoDiv").innerHTML = `第${received_msg[3][0]}回合，轮到${received_msg[3][1]}`
                            }
                            document.getElementById("playerInfo").innerHTML = `您是${factionNow}方`
                            document.getElementById("pregame").style.display = "none"
                            document.getElementById("chooseFaction").style.display = "none"
                            document.getElementById("game").style.display = "block"
                            setTimeout(() => {
                                document.getElementById("game").style.opacity = 1
                                audioRes[resToGet.indexOf("/res/m_bat_normal01_intro.ogg")].play("switch", "/res/m_bat_normal01_loop.ogg")

                            }, 10);
                        }, 510);
                        break
                    case "gameframe":
                        let dataPacket = received_msg[1]
                        switch (dataPacket.type) {
                            case "playerjoin":
                                if (dataPacket.data == 0) {
                                    document.getElementById("blueStateDiv").innerHTML = "在线"
                                } else {
                                    document.getElementById("redStateDiv").innerHTML = "在线"
                                }
                                let faction = () => {
                                    if (dataPacket.data == 0) {
                                        return "blue"
                                    } else {
                                        return "red"
                                    }
                                }
                                notice(`${faction()} 进入了游戏`)
                                break;
                            case "playerconfirm":
                                notice(`${dataPacket.data} 确认了布局`)
                                break
                            case "next":
                                if (dataPacket.data.turn == 1 & dataPacket.data.factionNow == "blue") {
                                    notice(`双方已确认布局，游戏开始`)
                                }
                                if (dataPacket.data.factionNow == factionNow & dataPacket.data.turn != 0) {
                                    notice("轮到你了")
                                    canAttack()
                                }
                                if (dataPacket.data.turn != 0) {
                                    document.getElementById("turnInfoDiv").innerHTML = `第${dataPacket.data.turn}回合，轮到${dataPacket.data.factionNow}`
                                }
                                break
                            case "attfail":
                                if (dataPacket.data.faction == factionNow) {
                                    document.getElementById("o" + dataPacket.data.pos).innerHTML = "x"
                                    playAudio("/res/b_ui_mark.ogg")
                                } else {
                                    document.getElementById("b" + dataPacket.data.pos).innerHTML = "x"
                                    playAudio("/res/b_ui_mark.ogg")
                                }
                                break
                            case "attsuccess":
                                if (dataPacket.data.faction == factionNow) {
                                    document.getElementById("o" + dataPacket.data.pos).innerHTML = "o"
                                    playAudio("/res/b_ui_mark.ogg")
                                } else {
                                    document.getElementById("b" + dataPacket.data.pos).innerHTML = "o"
                                    let posAtt = id2pos(dataPacket.data.pos)
                                    mapArr[posAtt[0]][posAtt[1]].destroy(dataPacket.data.pos)
                                    playAudio("/res/b_ui_alarmenter.ogg")
                                }
                                break
                            case "shipSink":
                                if (dataPacket.data.faction == factionNow) {
                                    let ramColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
                                    for (let index = 0; index < dataPacket.data.shipid.length; index++) {
                                        const id = "o" + dataPacket.data.shipid[index];
                                        document.getElementById(id).style.borderColor = ramColor
                                    }
                                }
                                break
                            case "playersuccess":
                                musicPlaying.forEach(obj => obj.pause())
                                document.getElementById("winnerNameDiv").innerHTML = dataPacket.faction
                                if (dataPacket.faction == factionNow) {
                                    notice("你胜利了！^_^")
                                    playAudio("/res/b_ui_win.ogg")
                                    setTimeout(() => {
                                        audioRes[resToGet.indexOf("/res/m_bat_victory_intro.ogg")].play("switch", "/res/m_bat_victory_loop.ogg")
                                    }, 3000);
                                } else {
                                    notice("你失败了！XD")
                                    audioRes[resToGet.indexOf("/res/m_bat_failed_intro_voice.ogg")].play("switch", "/res/m_bat_failed_loop.ogg")
                                }
                                document.getElementById("gameEndDiv").style.display = "block"
                                gameended = true
                                break;
                            case "map":

                                break
                            default:
                                break;
                        }
                    default:
                        break;
                }
            }

            ws.onclose = function () {
                document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[offline]"
                reject()
            };

            ws.onerror = () => {
                document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[offline]"
                reject()
            }
        } catch (error) {
            reject()
        }
    })
        .catch(e => {
            setTimeout(() => {
                tryWS()
                console.log("WS Connection failed, retry.");
            }, 2000);
        })
}

class musicObj {
    constructor(src) {
        this.src = src
    }
    play(option, value) {
        let ado = document.createElement("audio")
        ado.src = this.src
        ado.volume = 0.5
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

async function startLoad() {
    document.getElementById("loadBnt").style.display = "none"
    for (let index = 0; index < resToGet.length; index++) {
        const element = resToGet[index];
        await preload(element, index)
        setProgressBar(index + 1, resToGet.length, "progress")
    }
    document.querySelector("#loadBytes").innerHTML = `加载完成`
    document.querySelectorAll("button").forEach(element => {
        element.addEventListener("click", () => playAudio("/res/g_ui_confirm.ogg"))
    });
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
                        document.querySelector("#loadBytes").innerHTML = `正在加载资源 共${index}/${resToGet.length}个 当前资源${url} ${Math.ceil(oEvent.loaded / 1024)}KB / ${Math.ceil(oEvent.total / 1024)}KB`
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
    refreshInterval = setInterval(() => {
        ws.send(JSON.stringify(["getgames"]))
    }, 4000);
    tryWS()
}

function selectGame(id) {
    console.log(id);
    ws.send(JSON.stringify(["gselect", id]))
}

function createGame() {
    let name = document.getElementById("gameNameToCreate").value
    isCreatingRoom = true
    tagList = []
    if (name.length >= 3) {
        document.getElementById("gameSettingDiv").style.display = "block";
        document.getElementById("createRoomBnt").style.display = "block";
        refreshTagSelect()
    } else { alert("需要至少3位数的房间名") }
}

function joinBlue() {
    ws.send(JSON.stringify(["genter", roomId, 0]))
    factionNow = "blue"
}

function joinRed() {
    ws.send(JSON.stringify(["genter", roomId, 1]))
    factionNow = "red"
}

function htmlspecialchars(str) {
    str = String(str)
    str = str.replace(" ", "&nbsp")
    str = str.replace("&", "&amp")
    str = str.replace("<", "&lt")
    str = str.replace(">", "&gt")
    str = str.replace('"', "&quot")
    str = str.replace("'", "&apos")
    return str;
}

function notice(content) {
    let nNotice = document.createElement("div")
    nNotice.className = "notice"
    nNotice.innerHTML = content
    nNotice.style.opacity = 0
    document.getElementById("noticeContainer").appendChild(nNotice)
    setTimeout(() => {
        nNotice.style.opacity = 1
    }, 10);
    setTimeout(() => {
        nNotice.style.opacity = 0
        setTimeout(() => {
            nNotice.style.display = "none"
            nNotice.remove()
        }, 350);
    }, 2500);
}

function sendGameCreateRequest() {
    let name = document.getElementById("gameNameToCreate").value
    let tagListToSend = tagList.filter(e => e && e.trim())
    ws.send(JSON.stringify(["creategame", { name: name, tags: tagListToSend }]))
    document.getElementById("gameSettingDiv").style.display = "none";
    document.getElementById("createRoomBnt").style.display = "none";
    isCreatingRoom = false
    tagList = []
}

