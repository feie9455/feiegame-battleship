"use strict"

let reviewedSave = {}
let nowPlaybackTurn = 0
function reviewSave(id) {
    ws.send(JSON.stringify(["getSave", id]))
}
let saveArr = []

function downloadSave(id) {
    ws.send(JSON.stringify(["downloadSave", id]))
}

function handleSavePlaybackFromLocal() {
    let savedFile = document.getElementById("loadSaveFile").files[0]
    let reader = new FileReader()
    reader.onload = function () {
        handleSavePlayback(reader.result)
    }
    reader.readAsText(savedFile)

}

function handleSavePlayback(save) {
    nowPlaybackTurn = 0
    document.getElementById("existedSavesContainer").style.display = "none";
    saveArr = save.split("\n")
    reviewedSave.time = saveArr[1]
    reviewedSave.id = saveArr[3]
    reviewedSave.name = saveArr[5]
    document.getElementById("playbackRoomName").innerHTML = "房间名：" + reviewedSave.name
    document.getElementById("playbackRoomId").innerHTML = "房间ID：" + reviewedSave.id
    document.getElementById("playbackRoomTime").innerHTML = "创建时间：" + reviewedSave.time
    document.getElementById("noticeOfPlayback").style.display = "none"
    try {
        reviewedSave.tags = JSON.parse(saveArr[7])
    } catch (error) {
        reviewedSave.tags = []
    }
    if (reviewedSave.tags.includes("td11")) {
        reviewedSave.height = reviewedSave.width = 9
    } else if (reviewedSave.tags.includes("td21")) {
        reviewedSave.height = reviewedSave.width = 10
    } else if (reviewedSave.tags.includes("td31")) {
        reviewedSave.height = reviewedSave.width = 12
    } else {
        reviewedSave.height = reviewedSave.width = 8
    }

    let table = document.createElement("table")
    for (let h = 0; h < reviewedSave.height; h++) {
        let line = document.createElement("tr")
        for (let w = 0; w < reviewedSave.width; w++) {
            let block = document.createElement("td")
            block.className = "mapBlock"
            block.id = "b" + (h * reviewedSave.width + w)
            line.appendChild(block)
        }
        table.appendChild(line)
    }
    document.getElementById("main_").append(table)

    table = document.createElement("table")
    for (let h = 0; h < reviewedSave.height; h++) {
        let line = document.createElement("tr")
        for (let w = 0; w < reviewedSave.width; w++) {
            let block = document.createElement("td")
            block.className = "mapBlock_"
            block.id = "o" + (h * reviewedSave.width + w)
            line.appendChild(block)
        }
        table.appendChild(line)
    }
    document.getElementById("opponent_").append(table)
    document.getElementById("playback").style.display = "block"

}

function playbackPrev() {

}

function playbackNext() {
    let actionName = saveArr[nowPlaybackTurn * 3 + 8]
    //去除actionName的最后一个字符
    actionName = actionName.slice(0, actionName.length - 1)
    document.getElementById("playbackActionName").innerHTML = "事件：" + actionName

    if (actionName.includes("success")) {
        document.getElementById("reviewNextBnt").style.display = "none"
    } else {
        let actionContent = JSON.parse(saveArr[nowPlaybackTurn * 3 + 9].slice(6))
        let actionProperty
        try {
            actionProperty = JSON.parse(saveArr[nowPlaybackTurn * 3 + 10])
        } catch {
            actionProperty = saveArr[nowPlaybackTurn * 3 + 10]
        }
        if (actionName.includes("confirm")) {
            if (actionName.includes("blue")) {
                for (let lineIndex = 0; lineIndex < actionContent.length; lineIndex++) {
                    const line = actionContent[lineIndex];
                    for (let blockIndex = 0; blockIndex < line.length; blockIndex++) {
                        const element = line[blockIndex];
                        if (element) {
                            document.getElementById("b" + (lineIndex * reviewedSave.width + blockIndex)).style.backgroundColor = "blue"
                        }
                    }
                }
            } else {
                for (let lineIndex = 0; lineIndex < actionContent.length; lineIndex++) {
                    const line = actionContent[lineIndex];
                    for (let blockIndex = 0; blockIndex < line.length; blockIndex++) {
                        const element = line[blockIndex];

                        if (element) {
                            document.getElementById("o" + (lineIndex * reviewedSave.width + blockIndex)).style.backgroundColor = "red"
                        }
                    }
                }
            }
        } else {
            if (actionProperty.type == "normal") {
                //判断actionProperty.pos是否是数组
                /* 
                old version
                if (Array.isArray(actionProperty.pos)) {
                    if (actionName.includes("blue")) {
                        actionProperty.pos.forEach(pos => document.getElementById("o" + pos).innerHTML = "X")
                    }
                    else {
                        actionProperty.pos.forEach(pos => document.getElementById("b" + pos).innerHTML = "X")
                    }
                }
                else {
                    if (actionName.includes("blue")) {
                        document.getElementById("o" + actionProperty.pos).innerHTML = "X"
                    }
                    else {
                        document.getElementById("b" + actionProperty.pos).innerHTML = "X"
                    }
                }
                */
                actionProperty.result.forEach(element => {
                    if (element) {
                        if (actionName.includes("blue")) {
                            if (element.isMiss=="true") {
                                document.getElementById("o" + element.pos).innerHTML = "!"
                            } else if(element.isMiss=="false"){
                                document.getElementById("o" + element.pos).innerHTML = "o"
                            }else if(element.isMiss=="none"){
                                document.getElementById("o" + element.pos).innerHTML = "x"
                            }
                        }
                        else {
                            if (element.isMiss=="true") {
                                document.getElementById("b" + element.pos).innerHTML = "!"
                            } else if(element.isMiss=="false"){
                                document.getElementById("b" + element.pos).innerHTML = "o"
                            }else if(element.isMiss=="none"){
                                document.getElementById("b" + element.pos).innerHTML = "x"
                            }
                        };
                    }
                })
            }
        }
        document.getElementById("playbackTurnInfoDiv").innerHTML = `第${nowPlaybackTurn}个事件`
        nowPlaybackTurn++

    }
}