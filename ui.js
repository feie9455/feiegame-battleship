"use strict"
document.querySelectorAll(".loader").forEach(e => {
    setInterval(() => {
        setTimeout(() => {
            e.style.transform = "scale(1,1)"
        }, 50);
        e.style.opacity = 1
        setTimeout(() => {
            e.style.opacity = 0
            setTimeout(() => {
                e.style.transform = "scale(0,0)"

            }, 300);
        }, 170);
    }, 500);
})

let tagList = []
let tagListInfo = []
let tagLevel = 0
let isCreatingRoom = false
document.querySelectorAll(".tag").forEach(e => {
    e.onmousemove = () => {
        document.getElementById("tagDescription").innerHTML = "合约内容：" + e.getAttribute("data-description")
        if (!e.id.includes("ti")) {
            e.parentElement.querySelectorAll(".tag").forEach(element => {
                if (element != e) {
                    element.style.border = "1px solid red";
                }
            });
        }
    }
    e.onmouseleave = () => {
        document.getElementById("tagDescription").innerHTML = ""
        if (!e.id.includes("ti")) {
            e.parentElement.querySelectorAll(".tag").forEach(element => {
                if (element != e) {
                    element.style.border = ""
                }
            });
        }
    }
    e.onmousedown = () => {
        if (isCreatingRoom) {
            if (e.classList.contains("tagSelected")) {
                e.classList.remove("tagSelected")
                delete tagList[tagList.indexOf(e.id)]
            } else {
                if (!e.id.includes("ti")) {
                    { tagList.delAllInclude(e.id.slice(0, 2)) }
                }
                tagList.push(e.id)
            }
            refreshTagSelect()
        }
    }
})

document.getElementById("tagSelectorDiv").addEventListener("wheel", (e) => {
    smoothScrollBy(e.deltaY,0,document.getElementById("tagSelectorDiv"))
})

function viewRoomInfo(id) {
    document.getElementById("gameSettingDiv").style.display = "block";
    document.getElementById("enterRoomBnt").style.display = "block";
    document.getElementById("enterRoomBnt").onclick = () => {selectGame(id)}
    tagList = roomToTag[id]
    refreshTagSelect()
}

function viewSaveInfo(id) {
    document.getElementById("gameSettingDiv").style.display = "block";
    tagList = saveToTag[id]
    refreshTagSelect()
}
function smoothScrollBy(offsetX,offsetY,element) {
    let scrollX = element.scrollLeft
    let scrollY = element.scrollTop
    let step = 0
    let stepX = offsetX / 10
    let stepY = offsetY / 10
    let scrollInterval = setInterval(() => {
        step++
        scrollX += stepX
        scrollY += stepY
        element.scrollLeft = scrollX
        element.scrollTop = scrollY
        if (step >= 10) {
            clearInterval(scrollInterval)
        }
    }, 5);

}

function refreshTagSelect() {
    tagList.sort()
    tagListInfo = []
    tagLevel = 0
    document.querySelectorAll(".tag").forEach(e => { e.classList = ["tag"] })
    tagList.forEach(id => {
        if (id) {
            tagLevel += Number(id[2])
            tagListInfo.push({ tag: document.getElementById(id).innerHTML.slice(0, 5), description: document.getElementById(id).getAttribute("data-description") })
            document.getElementById(id).classList.add("tagSelected")
        }
    })

    document.getElementById("selectedTags").innerHTML = ""
    tagListInfo.forEach(info => document.getElementById("selectedTags").innerHTML += info.tag + "：" + info.description + "<br>")
    document.getElementById("tagLevelDiv").innerHTML = "合约等级：" + tagLevel
}

document.querySelectorAll(".closeCardBnt").forEach(e => {
    e.addEventListener("click", () => {
        e.parentElement.style.display = "none"
    })
})

function notice(content, type) {
    let nNotice = document.createElement("div")
    nNotice.className = "notice"
    nNotice.innerHTML = content
    nNotice.style.opacity = 0
    if (type) {
        if (type == "error") {
            nNotice.style.backgroundColor = "#F93154"
        } else if (type == "success") {
            nNotice.style.backgroundColor = "#00B74A"
        } else if (type == "warning") {
            nNotice.style.backgroundColor = "#FFA900"
        } else if (type == "info") {
            nNotice.style.backgroundColor = "#1266F0"
        }
    } else {
        nNotice.style.backgroundColor = "#1266F0"
    }
    
    document.getElementById("noticeContainer").appendChild(nNotice)
    setTimeout(() => {
        nNotice.style.opacity=0.9
    }, 10);
    setTimeout(() => {
        nNotice.style.opacity = 0
        setTimeout(() => {
            nNotice.style.display = "none"
            nNotice.remove()
        }, 350);
    }, 2500);
}

function viewNotification(index){
    document.getElementById("publicNotificationContentMain").innerHTML=noticeList[index].content
}


//删除数组中所有含有特殊字段的项
Array.prototype.delAllInclude = function (str) {
    for (let index = 0; index < this.length; index++) {
        const element = String(this[index]);
        if (element.includes(str)) {
            delete this[index]
        }
    }
}