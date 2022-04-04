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

function viewRoomInfo(id) {
    document.getElementById("gameSettingDiv").style.display = "block";
    tagList = roomToTag[id]
    refreshTagSelect()
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


//删除数组中所有含有特殊字段的项
Array.prototype.delAllInclude = function (str) {
    for (let index = 0; index < this.length; index++) {
        const element = String(this[index]);
        if (element.includes(str)) {
            delete this[index]
        }
    }
}