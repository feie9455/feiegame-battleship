"use strict"


let gameStarted = false
let mouseover
let turn = 0
let shipNum = 0
class ships {
    constructor(h, w, pos) {
        this.type = "aliveShip"
        this.h = h
        this.w = w
        this.pos = pos
        this.alive = h * w
        this.id = shipNum
        shipNum++
    }
    destroy(destroyPosition) {
        delete this.pos[this.pos.indexOf(destroyPosition)]
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
let height
let width
const id2pos = id => [Math.floor(id / width), id % width]
const pos2id = pos => pos[0] * width + pos[1]

const mapArr = []

function createMap() {
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
            block.className = "mapBlock"
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
            block.className = "mapBlock_"
            block.id = "o" + (h * width + w)
            line.appendChild(block)
        }
        table.appendChild(line)
    }
    document.getElementById("opponent").append(table)
    document.getElementById("main").querySelectorAll(".mapBlock").forEach(element => addMapListener(element))

}

function addItemListener(element) {
    element.addEventListener("mouseover", () => {
        element.parentElement.querySelectorAll("td").forEach(e => e.style.borderColor = factionNow)
    })
    element.addEventListener("mouseleave", () => {
        element.parentElement.querySelectorAll("td").forEach(e => {
            e.style.borderColor = "black";
        })

    })
    element.addEventListener("dblclick", () => {
        setTimeout(() => {
            cycle(element)
        }, 100);
    })
    element.addEventListener("mousedown", () => {


    })
    element.addEventListener("touchstart", () => {


    })
    element.onmousedown = function (event) {
        let offx = (window.event.clientX - getElementLeft(element.parentElement.parentElement.parentElement.parentElement))
        let offy = (window.event.clientY - getElementTop(element.parentElement.parentElement.parentElement.parentElement))
        element.parentElement.parentElement.parentElement.parentElement.style.transformOrigin = `${offx}px ${offy}px`
        element.parentElement.parentElement.parentElement.parentElement.style.transform = "scale(1.8,1.8)"
        let mouseoverE = document.elementsFromPoint(event.clientX, event.clientY)[3]
        if (mouseoverE) {
            if (mouseoverE.id.slice(0, 1) == "b" & mouseoverE.className == "mapBlock") {
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
        let refresh = function (event) {
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
            refresh(event)
            mouseoverE = document.elementsFromPoint(event.clientX, event.clientY)[3]
            if (mouseoverE) {
                if (mouseoverE.id.slice(0, 1) == "b" & mouseoverE.className == "mapBlock") {
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
                            if (document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor == factionNow) { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eH; index++) {
                                posToPut.push(mouseover - width * pos + index * width)
                            }
                            let thisShip
                            switch (Number(eH)) {
                                case 1:
                                    thisShip = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisShip = new b2shipH(posToPut)
                                    break
                                case 3:
                                    thisShip = new b3shipH(posToPut)
                                    break
                                case 4:
                                    thisShip = new b4shipH(posToPut)
                                    break
                                default:
                                    break;
                            }
                            for (let index = 0; index < eH; index++) {
                                document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor = factionNow
                                document.getElementById("b" + (mouseover - width * pos + index * width)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - width * pos + index * width) / width)][(mouseover - width * pos + index * width) % width] = thisShip
                            }
                            this.onmousedown = null
                            success = true
                        }
                    }
                } else {
                    let pos = getPosW(element)

                    if (pos <= mouseover % width & (mouseover % width) - pos <= (width - eW)) {
                        for (let index = 0; index < eW; index++) {
                            if (document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor == factionNow) { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eW; index++) {
                                posToPut.push(mouseover - pos + index)
                            }
                            let thisShip
                            switch (Number(eW)) {
                                case 1:
                                    thisShip = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisShip = new b2shipW(posToPut)
                                    break
                                case 3:
                                    thisShip = new b3shipW(posToPut)
                                    break
                                case 4:
                                    thisShip = new b4shipW(posToPut)
                                    break
                                default:
                                    break;
                            }
                            let ramColor = createRamColor()
                            for (let index = 0; index < eW; index++) {
                                document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor = factionNow
                                document.getElementById("b" + (mouseover - pos + index)).style.borderColor = ramColor

                                document.getElementById("b" + (mouseover - pos + index)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - pos + index) / width)][(mouseover - pos + index) % width] = thisShip
                            }
                            success = true
                        }
                    }
                }

                if (success) {
                    element_.parentElement.parentElement.parentElement.parentElement.setAttribute("data-used", "true")
                    setTimeout(() => {
                        element_.parentElement.parentElement.parentElement.parentElement.style.opacity = 0
                        setTimeout(() => {
                            element_.parentElement.parentElement.parentElement.parentElement.remove()
                        }, 100);
                    }, 10);
                }
            }
        }
    }
    element.ontouchstart = function (event) {
        element.parentElement.querySelectorAll("td").forEach(e => e.style.borderColor = factionNow)
        let offx = (event.targetTouches[0].clientX - getElementLeft(element.parentElement.parentElement.parentElement.parentElement))
        let offy = (event.targetTouches[0].clientY - getElementTop(element.parentElement.parentElement.parentElement.parentElement))
        element.parentElement.parentElement.parentElement.parentElement.style.transformOrigin = `${offx}px ${offy}px`
        element.parentElement.parentElement.parentElement.parentElement.style.transform = "scale(1.8,1.8)"
        let mouseoverE = document.elementsFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY)[3]
        if (mouseoverE) {
            if (mouseoverE.id.slice(0, 1) == "b" & mouseoverE.className == "mapBlock") {
                mouseover = mouseoverE.id.slice(1)
            } else {
                mouseover = undefined
            }
        }
        var event = event || window.event;
        var diffX = event.targetTouches[0].clientX
        var diffY = event.targetTouches[0].clientY
        let Y0 = parseInt(element.parentElement.parentElement.parentElement.parentElement.style.top)
        let X0 = parseInt(element.parentElement.parentElement.parentElement.parentElement.style.left)
        let element_ = element
        let objx
        let objy
        let refresh = function (event) {
            element_.parentElement.parentElement.parentElement.parentElement.style.top = objy
            element_.parentElement.parentElement.parentElement.parentElement.style.left = objx
        }
        if (typeof element_.setCapture !== 'undefined') {
            this.setCapture();
        }
        document.ontouchmove = function (event) {
            var event = event || window.event;
            objx = X0 + event.targetTouches[0].clientX - diffX + "px"
            objy = Y0 + event.targetTouches[0].clientY - diffY + "px"
            refresh(event)
            mouseoverE = document.elementsFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY)[3]
            if (mouseoverE) {
                if (mouseoverE.id.slice(0, 1) == "b" & mouseoverE.className == "mapBlock") {
                    mouseover = mouseoverE.id.slice(1)
                } else {
                    mouseover = undefined
                }
            }
        }
        document.ontouchend = function (event) {
            element.parentElement.querySelectorAll("td").forEach(e => {
                e.style.borderColor = "black";
            })

            element.parentElement.parentElement.parentElement.parentElement.style.transform = "scale(1,1)";
            this.ontouchmove = null;
            this.ontouchend = null;
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
                            if (document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor == factionNow) { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eH; index++) {
                                posToPut.push(mouseover - width * pos + index * width)
                            }
                            let thisShip
                            switch (Number(eH)) {
                                case 1:
                                    thisShip = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisShip = new b2shipH(posToPut)
                                    break
                                case 3:
                                    thisShip = new b3shipH(posToPut)
                                    break
                                case 4:
                                    thisShip = new b4shipH(posToPut)
                                    break
                                default:
                                    break;
                            }
                            for (let index = 0; index < eH; index++) {
                                document.getElementById("b" + (mouseover - width * pos + index * width)).style.backgroundColor = factionNow
                                document.getElementById("b" + (mouseover - width * pos + index * width)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - width * pos + index * width) / width)][(mouseover - width * pos + index * width) % width] = thisShip
                            }
                            this.onmousedown = null
                            success = true
                        }
                    }
                } else {
                    let pos = getPosW(element)

                    if (pos <= mouseover % width & (mouseover % width) - pos <= (width - eW)) {
                        for (let index = 0; index < eW; index++) {
                            if (document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor == factionNow) { isConflict = true }
                        }
                        if (!isConflict) {
                            let posToPut = []
                            for (let index = 0; index < eW; index++) {
                                posToPut.push(mouseover - pos + index)
                            }
                            let thisShip
                            switch (Number(eW)) {
                                case 1:
                                    thisShip = new b1ship(posToPut)
                                    break;
                                case 2:
                                    thisShip = new b2shipW(posToPut)
                                    break
                                case 3:
                                    thisShip = new b3shipW(posToPut)
                                    break
                                case 4:
                                    thisShip = new b4shipW(posToPut)
                                    break
                                default:
                                    break;
                            }
                            let ramColor = createRamColor()
                            for (let index = 0; index < eW; index++) {
                                document.getElementById("b" + (mouseover - pos + index)).style.backgroundColor = factionNow
                                document.getElementById("b" + (mouseover - pos + index)).style.borderColor = ramColor
                                document.getElementById("b" + (mouseover - pos + index)).classList.add("canRemove")
                                mapArr[Math.floor((mouseover - pos + index) / width)][(mouseover - pos + index) % width] = thisShip
                            }
                            success = true
                        }
                    }
                }

                if (success) {
                    element_.parentElement.parentElement.parentElement.parentElement.setAttribute("data-used", "true")
                    setTimeout(() => {
                        element_.parentElement.parentElement.parentElement.parentElement.style.opacity = 0
                        setTimeout(() => {
                            element_.parentElement.parentElement.parentElement.parentElement.remove()
                        }, 100);
                    }, 10);
                }
            }
        }
    }

}

function addMapListener(element) {
    element.addEventListener("click", () => {
        let thisId = element.id.slice(1)
        let clickedE = mapArr[id2pos(thisId)[0]][id2pos(thisId)[1]]
        if (!gameStarted) {
            if (clickedE instanceof ships) {
                for (let index = 0; index < clickedE.pos.length; index++) {
                    const position = clickedE.pos[index];
                    mapArr[id2pos(position)[0]][id2pos(position)[1]] = null
                    document.getElementById("b" + position).style.backgroundColor = ""
                    document.getElementById("b" + position).style.borderColor = ""

                    document.getElementById("b" + position).classList.remove("canRemove")
                }
                createShip(clickedE.h, clickedE.w)
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
    let newShip
    newShip = document.createElement("div")
    newShip.className = "ships"
    let tbody = document.createElement("tbody")
    newShip.style.top = "10px"
    newShip.style.left = "10px"
    newShip.setAttribute("height", h)
    newShip.setAttribute("width", w)

    let table = document.createElement("table")
    if (h > w) {

        for (let index = 0; index < h; index++) {
            let line = document.createElement("tr")
            let block = document.createElement("td")
            block.className = "shipBlock"
            addItemListener(block)
            line.appendChild(block)
            tbody.appendChild(line)
        }
        table.appendChild(tbody)
        newShip.append(table)
    } else {

        let line = document.createElement("tr")
        for (let index = 0; index < w; index++) {
            let block = document.createElement("td")
            block.className = "shipBlock"
            addItemListener(block)
            line.appendChild(block)
        }
        let tbody = document.createElement("tbody")
        tbody.appendChild(line)
        table.appendChild(tbody)
        newShip.append(table)
    }
    if (posX) {
        newShip.style.left = posX
        newShip.style.top = posY
    }
    return item.appendChild(newShip)
}

function cycle(element) {
    setTimeout(() => {
        if (element.parentElement.parentElement.parentElement.parentElement.getAttribute("data-used") != "true") {
            let thisShip = element.parentElement.parentElement.parentElement.parentElement
            createShip(thisShip.getAttribute("width"), thisShip.getAttribute("height"), thisShip.style.left, thisShip.style.top)
            thisShip.remove()
        }
    }, 100);
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

function confirmPlace() {

    let data = JSON.stringify(mapArr)
    if (gameStarted) {

    } else {
        if (document.getElementsByClassName("shipBlock")[0]) {
            if (!confirm("船还没放完，舍弃剩下的船吗？")) {
                return
            }
        }
        ws.send(JSON.stringify(["gameframe", { type: "confirm", id: roomId, faction: factionNow, data: data }]))
        document.querySelectorAll(".shipBlock").forEach(e => e.remove())
        gameStarted = true
        document.getElementById("confirmPlaceBnt").style.display = "none"
    }
}

function canAttack() {
    if (!gameended) {
        document.querySelectorAll(".mapBlock_").forEach(
            element => {
                if (!element.innerHTML) {
                    element.onmousemove = () => {
                        element.style.borderColor = "orange"
                    }
                    element.onmouseleave = () => {
                        element.style.borderColor = "black"

                    }
                    element.onmousedown = () => {
                        attack(element.id.slice(1))
                        element.style.borderColor = "black"

                    }

                }
            }
        )

    }
}

function stopAttack() {
    document.querySelectorAll(".mapBlock_").forEach(
        element => {
            element.onmousemove = undefined
            element.onmouseleave = undefined
            element.onmousedown = undefined
        }

    )

}

function attack(id) {
    stopAttack()
    console.log(`a:${id}`);
    ws.send(JSON.stringify(["gameframe", { type: "attack", id: roomId, faction: factionNow, data: { pos: id, type: "normal" } }]))
}