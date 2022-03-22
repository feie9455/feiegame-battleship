"use strict"
let gameStarted = false
let mouseover
class ships {
    constructor(h, w, pos) {
        this.h = h
        this.w = w
        this.pos = pos
        this.alive = h * w
    }
    destory(dpos) {
        delete this.pos[this.pos.indexOf(dpos)]
        this.alive--
        if (this.alive < 1) {
            delete this
        }
    }
}
class b1ship extends ships {
    constructor(pos) {
        super(1, 1, pos)
    }
}
class b2ship extends ships {
    constructor(h, w, pos) {
        super(h, w, pos)
    }
}
class b2shipH extends b2ship {
    constructor(pos) {
        super(2, 1, pos)
    }
}
class b2shipW extends b2ship {
    constructor(pos) {
        super(1, 2, pos)
    }
}
class b3ship extends ships {
    constructor(h, w, pos) {
        super(h, w, pos)
    }
}
class b3shipH extends b3ship {
    constructor(pos) {
        super(3, 1, pos)
    }
}
class b3shipW extends b3ship {
    constructor(pos) {
        super(1, 3, pos)
    }
}
class b4ship extends ships {
    constructor(h, w, pos) {
        super(h, w, pos)
    }
}
class b4shipH extends b4ship {
    constructor(pos) {
        super(4, 1, pos)
    }
}
class b4shipW extends b4ship {
    constructor(pos) {
        super(1, 4, pos)
    }
}

const item = document.getElementById("item")
const height = 8
const width = 8
const id2pos = id => [Math.floor(id / width), id % width]
const pos2id = pos => pos[0] * width + pos[1]

createShip(1, 4)
createShip(1, 3)
createShip(1, 3)
createShip(1, 2)
createShip(1, 2)
createShip(1, 2)
const mapArr = []
for (let index = 0; index < height; index++) {
    let line = []
    for (let index = 0; index < width; index++) {
        line.push(null)

    }
    mapArr.push(line)
}
let table = document.createElement("table")
for (let h = 0; h < height; h++) {
    let line = document.createElement("tr")
    for (let w = 0; w < width; w++) {
        let block = document.createElement("td")
        block.className = "mapblock"
        block.id = "b" + (h * width + w)
        line.appendChild(block)
    }
    table.appendChild(line)
}
document.getElementById("main").append(table)

table = document.createElement("table")
for (let h = 0; h < height; h++) {
    let line = document.createElement("tr")
    for (let w = 0; w < width; w++) {
        let block = document.createElement("td")
        block.className = "mapblock_"
        block.id = "o" + (h * width + w)
        line.appendChild(block)
    }
    table.appendChild(line)
}
document.getElementById("opponent").append(table)

function addItemListener(element) {
    element.addEventListener("mouseover", () => {
        element.parentElement.querySelectorAll("td").forEach(e => e.style.borderColor = "blue")
    })
    element.addEventListener("mouseleave", () => {
        element.parentElement.querySelectorAll("td").forEach(e => {
            e.style.borderColor = "black";
        })

    })
    element.addEventListener("dblclick", () => cycle(element))
    element.addEventListener("mousedown", () => {
        let offx = (window.event.clientX - getElementLeft(element.parentElement.parentElement.parentElement.parentElement))
        let offy = (window.event.clientY - getElementTop(element.parentElement.parentElement.parentElement.parentElement))
        element.parentElement.parentElement.parentElement.parentElement.style.transformOrigin = `${offx}px ${offy}px`
        element.parentElement.parentElement.parentElement.parentElement.style.transform = "scale(1.8,1.8)"

    })
    element.onmousedown = function (event) {
        let mouseoverE = document.elementsFromPoint(event.clientX, event.clientY)[3]
        if (mouseoverE) {
            if (mouseoverE.id.length > 0 & mouseoverE.className == "mapblock") {
                mouseover = mouseoverE.id.slice(1)
            } else {
                mouseover = undefined
            }
        }
        var event = event || window.event;
        var diffX = event.clientX
        var diffY = event.clientY
        let Y0 = parseInt(element.parentElement.parentElement.parentElement.parentElement.style.top)
        let X0 = parseInt(element.parentElement.parentElement.parentElement.parentElement.style.left)
        let element_ = element
        let objx
        let objy
        let refrush = function (event) {
            element_.parentElement.parentElement.parentElement.parentElement.style.top = objy
            element_.parentElement.parentElement.parentElement.parentElement.style.left = objx
        }
        if (typeof element_.setCapture !== 'undefined') {
            this.setCapture();
        }
        document.onmousemove = function (event) {
            var event = event || window.event;
            objx = X0 + event.clientX - diffX + "px"
            objy = Y0 + event.clientY - diffY + "px"
            refrush(event)
            mouseoverE = document.elementsFromPoint(event.clientX, event.clientY)[3]
            if (mouseoverE) {
                if (mouseoverE.id.length > 0 & mouseoverE.className == "mapblock") {
                    mouseover = mouseoverE.id.slice(1)
                } else {
                    mouseover = undefined
                }
            }
        }
        document.onmouseup = function (event) {
            element.parentElement.parentElement.parentElement.parentElement.style.transform = "scale(1,1)";
            this.onmousemove = null;
            this.onmouseup = null;
            if (typeof element_.releaseCapture != 'undefined') {
                element_.releaseCapture();
            }
            console.log(mouseover);
            if (mouseover) {
                let success = false
                let eW = element.parentElement.parentElement.parentElement.parentElement.getAttribute("width")
                let eH = element.parentElement.parentElement.parentElement.parentElement.getAttribute("height")
                let isConflict = false
                if (eH >= eW) {
                    let pos = getPosH(element)
                    let mouseoverLine = id2pos(mouseover)[0]
                    if (mouseoverLine >= pos & mouseoverLine + (eH - pos - 1) <= height - 1) {
                        for (let index = 0; index < eH; index++) {
                            if (document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor == "blue") { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eH; index++) {
                                posToPut.push(mouseover - width * pos + index * width)
                            }
                            let thisship
                            switch (Number(eH)) {
                                case 1:
                                    thisship = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisship = new b2shipH(posToPut)
                                    break
                                case 3:
                                    thisship = new b3shipH(posToPut)
                                    break
                                case 4:
                                    thisship = new b4shipH(posToPut)
                                    break
                                default:
                                    break;
                            }
                            for (let index = 0; index < eH; index++) {
                                document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor = "blue"
                                document.getElementById("b" + (mouseover - width * pos + index * width)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - width * pos + index * width) / width)][(mouseover - width * pos + index * width) % width] = thisship
                            }
                            success = true
                        }
                    }
                } else {
                    let pos = getPosW(element)

                    if (pos <= mouseover % width & (mouseover % width) - pos <= (width - eW)) {
                        for (let index = 0; index < eW; index++) {
                            if (document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor == "blue") { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eW; index++) {
                                posToPut.push(mouseover - pos + index)
                            }
                            let thisship
                            switch (Number(eW)) {
                                case 1:
                                    thisship = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisship = new b2shipW(posToPut)
                                    break
                                case 3:
                                    thisship = new b3shipW(posToPut)
                                    break
                                case 4:
                                    thisship = new b4shipW(posToPut)
                                    break
                                default:
                                    break;
                            }
                            for (let index = 0; index < eW; index++) {
                                document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor = "blue"
                                document.getElementById("b" + (mouseover - pos + index)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - pos + index) / width)][(mouseover - pos + index) % width] = thisship
                            }
                            success = true
                        }
                    }
                }

                if (success) {
                    setTimeout(() => {
                        element_.parentElement.parentElement.parentElement.parentElement.style.opacity = 0
                        setTimeout(() => {
                            element_.parentElement.parentElement.parentElement.parentElement.style.display = "none"
                        }, 100);
                    }, 10);
                }
            }
        }
    }
}

document.getElementById("main").querySelectorAll(".mapblock").forEach(element => addMapListener(element))
function addMapListener(element) {
    element.addEventListener("click", () => {
        let thisid = element.id.slice(1)
        let clickdE = mapArr[id2pos(thisid)[0]][id2pos(thisid)[1]]
        if (!gameStarted) {
            if (clickdE instanceof ships) {
                for (let index = 0; index < clickdE.pos.length; index++) {
                    const position = clickdE.pos[index];
                    mapArr[id2pos(position)[0]][id2pos(position)[1]] = null
                    document.getElementById("b" + position).style.backgroundColor = ""
                    document.getElementById("b" + position).classList.remove("canRemove")
                }
                createShip(clickdE.h, clickdE.w)
            }
        }
    })
}


function getPosW(element) {
    let pos = 0
    for (const iterator of element.parentElement.children) {
        if (element == iterator) {
            return pos
        }
        pos++
    }
}

function getPosH(element) {
    let pos = 0
    for (const iterator of element.parentElement.parentElement.children) {
        if (element.parentElement == iterator) {
            return pos
        }
        pos++
    }
}

function createShip(h, w, posX, posY) {
    let newship
    newship = document.createElement("div")
    newship.className = "ships"
    let tbody = document.createElement("tbody")
    newship.style.top = "10px"
    newship.style.left = "10px"
    newship.setAttribute("height", h)
    newship.setAttribute("width", w)

    let table = document.createElement("table")
    if (h > w) {

        for (let index = 0; index < h; index++) {
            let line = document.createElement("tr")
            let block = document.createElement("td")
            block.className="shipblock"
            addItemListener(block)
            line.appendChild(block)
            tbody.appendChild(line)
        }
        table.appendChild(tbody)
        newship.append(table)
    } else {

        let line = document.createElement("tr")
        for (let index = 0; index < w; index++) {
            let block = document.createElement("td")
            block.className="shipblock"
            addItemListener(block)
            line.appendChild(block)
        }
        let tbody = document.createElement("tbody")
        tbody.appendChild(line)
        table.appendChild(tbody)
        newship.append(table)
    }
    if (posX) {
        newship.style.left = posX
        newship.style.top = posY
    }
    return item.appendChild(newship)
}
function cycle(element) {
    let thisship = element.parentElement.parentElement.parentElement.parentElement
    createShip(thisship.getAttribute("width"), thisship.getAttribute("height"), thisship.style.left, thisship.style.top)
    thisship.remove()
}

function itemsGetBack() {
    document.getElementById("item").querySelectorAll(".ships").forEach(element => {
        element.style.transitionProperty = "all"
        element.style.transitionDuration = "0.2s"
        element.style.left = "10px"
        element.style.top = "10px"
        setTimeout(() => {
            element.style.transitionProperty = "opacity, transform"
            element.style.transitionDuration = "0.1s, 0.2s"

        }, 200);
    })
}

function getElementLeft(element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}

function getElementTop(element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

let ws
tryWS()
function tryWS() {
    try {
        ws = new WebSocket("wss://127.0.0.1:9454")
        ws.onopen = function () {
            console.log(`WS connection OK.`);
            document.getElementsByTagName("title")[0].innerHTML = "Feiegame-battleship[online]"
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            console.log(`WS received ${received_msg}`);
            if (received_msg.slice(0, 5) == "games") {
                document.querySelector("#existedGames").remove()
                let existedGames = document.createElement("div")
                existedGames.id = "existedGames"
                let gamesarr = received_msg.split("//")
                gamesarr.shift()
                for (let index = 0; index < gamesarr.length; index++) {
                    const element = gamesarr[index];
                    let obj = document.createElement("li")
                    let obj2 = document.createElement("a")
                    obj2.innerHTML = htmlspecialchars(element)

                    obj2.class = "existgameli"
                    obj2.href = `javascript:enterGame(${index})`
                    obj.appendChild(obj2)
                    existedGames.appendChild(obj)
                }
                document.querySelector("#existedGamesContainer").appendChild(existedGames)
            } else if (received_msg == "samegame") {
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

function confirm() {
    let data=JSON.stringify(mapArr)
    ws.send(`gstart:${data}`)
}