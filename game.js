"use strict"

const resToGet = ["/res/m_sys_void_intro.ogg", "/res/m_sys_void_loop.ogg", "/res/m_sys_title_intro.ogg", "/res/m_sys_title_loop.ogg", "/res/m_bat_normal01_intro.ogg",
    "/res/m_bat_normal01_loop.ogg", "/res/m_sys_ccs0_loop.ogg", "/res/m_sys_ccs0_intro.ogg", "/res/g_ui_btn_n.ogg", "/res/g_ui_confirm.ogg", "/res/g_ui_item.ogg", "/res/b_ui_mark.ogg", "/res/b_ui_alarmenter.ogg", "/res/b_ui_win.ogg", "/res/m_bat_failed_loop.ogg", "/res/m_bat_failed_intro_voice.ogg", "/res/m_bat_victory_loop.ogg", "/res/m_bat_victory_intro.ogg"]
const audioRes = []
const musicPlaying = []
let ws
let roomId
let factionNow
let refreshInterval
let gameended = false
let roomToTag = {}
let roomTags = []
let roomName = ""
let saveToTag = {}

function tryWS() {
    return new Promise(function (resolve, reject) {
        document.getElementById("WSLoadDiv").style.display = "block"
        try {
            if (!WebSocket) {
                alert("您的浏览器不支持Websocket，请升级您的浏览器。")
            }
            ws = new WebSocket(`wss://${window.location.hostname}:9454`)
            ws.onopen = function () {
                document.getElementById("WSLoadDiv").style.display = "none"
                console.log(`WS connection OK.`);
                document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[online]"
            };

            ws.onmessage = function (evt) {
                var received_msg = JSON.parse(evt.data);
                console.log(evt.data);
                let table
                switch (received_msg[0]) {
                    case "chat":
                        document.getElementById("chatContentDiv").innerHTML += `<div class="chatContent"><strong>${received_msg[1].faction}:</strong> ${htmlspecialchars(received_msg[1].msg)}</div>`
                        document.querySelectorAll(".chatContent")[document.querySelectorAll(".chatContent").length - 1].scrollIntoView({ behavior: "smooth" })
                        break;
            
                    case "download":
                        //下载文件
                        let a = document.createElement("a")
                        a.href = URL.createObjectURL(new Blob([received_msg[2]], { type: "text/plain" }))
                        a.download = received_msg[1]
                        a.click()
                        break;

                    case "warning":
                        notice(received_msg[1], "warning")
                        break;
                    case "success":
                        notice(received_msg[1], "success")
                        break;

                    case "savelist":
                        if (document.getElementById("loadingSaveNotice")) {
                            document.getElementById("loadingSaveNotice").remove()
                        }
                        table = document.createElement("table")
                        table.id = "existedSaves";
                        table.style.width = "80%"
                        table.innerHTML += ("<tr><td>房间名</td><td>唯一识别码</td><td>所选合约</td><td>放映</td><td>下载</td></tr>")
                        for (let index = 0; index < received_msg[1].length; index++) {
                            const lineData = received_msg[1][index];
                            let line = document.createElement("tr")
                            for (const key in lineData) {
                                if (Object.hasOwnProperty.call(lineData, key)) {
                                    const element = lineData[key];
                                    let block = document.createElement("td")
                                    if (key == "tags") {
                                        block.innerHTML = `<a href="javascript:viewSaveInfo('${lineData["id"]}')">查看合约</a>`
                                        saveToTag[lineData["id"]] = element
                                    } else {
                                        block.innerHTML = htmlspecialchars(element)
                                    }
                                    line.appendChild(block)
                                }
                            }
                            line.innerHTML += `<td><a href='javascript:reviewSave("${lineData["id"]}")'>→</a></td>`
                            line.innerHTML += `<td><a href='javascript:downloadSave("${lineData["id"]}")'>→</a></td>`
                            table.appendChild(line)
                        }
                        document.getElementById("existedSaves").remove()
                        document.getElementById("existedSavesContainer").appendChild(table)
                        break;
                    case "save":
                        handleSavePlayback(received_msg[1])
                        break;
                    case "gamelist":
                        if (document.getElementById("loadingRoomNotice")) {
                            document.getElementById("loadingRoomNotice").remove()
                        }
                        table = document.createElement("table")
                        table.id = "existedGames";
                        table.innerHTML += ("<tr><td>房间名</td><td>唯一识别码</td><td>蓝方状态</td><td>红方状态</td><td>房间状态</td><td>操作</td></tr>")
                        for (let index = 0; index < received_msg[1].length; index++) {
                            const lineData = received_msg[1][index];
                            let line = document.createElement("tr")
                            for (const key in lineData) {
                                if (Object.hasOwnProperty.call(lineData, key)) {
                                    const element = lineData[key];
                                    let block = document.createElement("td")
                                    if (key == "tags") {
                                        roomToTag[lineData["id"]] = element

                                    } else {
                                        block.innerHTML = htmlspecialchars(element)
                                        line.appendChild(block)

                                    }
                                }
                            }
                            line.innerHTML += `<td><a href="javascript:editRoom('${lineData["id"]}')">删除</a></td>`
                            if (index % 2) {
                                line.classList.add("oddtr")
                            } else {
                                line.classList.add("eventr")
                            }
                            line.ondblclick = function () { viewRoomInfo(lineData["id"]) }
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
                        document.getElementById('closeGameSettingBnt').click()
                        roomTags = received_msg[1].tags
                        clearInterval(refreshInterval)
                        document.getElementById("pregame").style.opacity = 0
                        document.getElementById("chooseFaction").style.opacity = 0
                        if (received_msg[1].nowTurn != 0) {
                            gameStarted = true
                        }
                        if (roomTags.includes("td11")) {
                            height = width = 9
                        } else if (roomTags.includes("td21")) {
                            height = width = 10
                        } else if (roomTags.includes("td31")) {
                            height = width = 12
                        } else {
                            height = width = 8
                        }

                        createMap()

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
                            roomName = received_msg[1].name
                            document.getElementById("roomInfo").innerHTML = `房间名：${roomName}`

                            document.getElementById("blueStateDiv").innerHTML = num2State(received_msg[1].blueState)
                            document.getElementById("redStateDiv").innerHTML = num2State(received_msg[1].redState)
                            if (received_msg[1].nowTurn == 0) {
                                document.getElementById("turnInfoDiv").innerHTML = `第${received_msg[1].nowTurn}回合，请放置`
                            } else {
                                document.getElementById("turnInfoDiv").innerHTML = `第${received_msg[1].nowTurn}回合，轮到${received_msg[1].nowPlayer}`
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
                            case "senditem":
                                dataPacket.items.forEach(item => {
                                    if (item.type == "ship") {
                                        createShip(1, item.length)
                                    }
                                })
                                break
                            case "playerconfirm":
                                notice(`${dataPacket.data} 确认了布局`)
                                break
                            case "next":
                                if (dataPacket.data.turn == 1 & dataPacket.data.factionNow == "blue") {
                                    notice(`双方已确认布局，游戏开始`)
                                }
                                if (dataPacket.data.factionNow == factionNow & dataPacket.data.turn != 0) {
                                    notice("轮到你了")
                                    canAttack(dataPacket.data.canAttackTimes)
                                    document.getElementById("attackInfo").innerHTML = `剩余攻击次数：${dataPacket.data.canAttackTimes}`
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
                            case "attmiss":
                                if (dataPacket.data.faction == factionNow) {
                                    document.getElementById("o" + dataPacket.data.pos).innerHTML = "!"
                                    setTimeout(() => {
                                        document.getElementById("o" + dataPacket.data.pos).setAttribute("data-selected", "false")

                                    }, 200);

                                    playAudio("/res/b_ui_mark.ogg")
                                } else {
                                    document.getElementById("b" + dataPacket.data.pos).innerHTML = "!"
                                    setTimeout(() => {
                                        document.getElementById("o" + dataPacket.data.pos).setAttribute("data-selected", "false")

                                    }, 200);
                                    playAudio("/res/b_ui_alarmenter.ogg")
                                }
                                break

                            case "shipSink":
                                if (dataPacket.data.faction == factionNow) {
                                    let ramColor = createRamColor()
                                    setTimeout(() => {
                                        for (let index = 0; index < dataPacket.data.shipid.length; index++) {
                                            const id = "o" + dataPacket.data.shipid[index];
                                            document.getElementById(id).style.borderColor = ramColor
                                        }

                                    }, 300);
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


function sendGameCreateRequest() {
    let name = document.getElementById("gameNameToCreate").value
    let tagListToSend = tagList.filter(e => e && e.trim())
    ws.send(JSON.stringify(["creategame", { name: name, tags: tagListToSend }]))
    document.getElementById("gameSettingDiv").style.display = "none";
    document.getElementById("createRoomBnt").style.display = "none";
    isCreatingRoom = false
    tagList = []
}

function editRoom(id) {
    if (confirm("确定要删除房间吗？")) {
        ws.send(JSON.stringify(["editRoom", id]))
    }
}

function enterSavePlayback() {
    musicPlaying.forEach(obj => obj.pause())
    audioRes[resToGet.indexOf("/res/m_sys_ccs0_intro.ogg")].play("switch", "/res/m_sys_ccs0_loop.ogg")

    document.getElementById("pregame").style.opacity = "0"
    setTimeout(() => {
        document.getElementById("pregame").style.display = "none"
        document.getElementById("savePlayback").style.display = "block"
        document.getElementById("savePlayback").style.opacity = 0
        setTimeout(() => {
            document.getElementById("savePlayback").style.opacity = 1
        }, 10);

    }, 510);
    ws.send(JSON.stringify(["getSaveList"]))
}