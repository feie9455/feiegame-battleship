"use strict"

const resToGet = ["/res/m_sys_void_intro.ogg", "/res/m_sys_void_loop.ogg", "/res/m_sys_title_intro.ogg", "/res/m_sys_title_loop.ogg", "/res/m_bat_normal01_intro.ogg",
    "/res/m_bat_normal01_loop.ogg", "/res/m_sys_ccs0_loop.ogg", "/res/m_sys_ccs0_intro.ogg", "/res/g_ui_btn_n.ogg", "/res/g_ui_confirm.ogg", "/res/g_ui_item.ogg",
    "/res/b_ui_mark.ogg", "/res/b_ui_alarmenter.ogg", "/res/b_ui_win.ogg", "/res/m_bat_failed_loop.ogg", "/res/m_bat_failed_intro_voice.ogg", "/res/m_bat_victory_loop.ogg",
    "/res/m_bat_victory_intro.ogg", "/res/emoji.zip"]
const audioRes = []
const musicPlaying = []
let emoji = {}

window.onresize = () => {
    document.getElementById("chatInputText").style.width = document.getElementById("chat").clientWidth - 102 + "px"
}

document.onclick = e => {
    if (e.target.id != "emojiList" && e.target.id != "showEmojiBnt" && e.target.className != "emojiListItem" && e.target.id != "emoji") {
        document.getElementById("emoji").style.display = "none"
    }
}

window.onload = () => {

    localforage.getItem("viewedCopyright").then(isViewed => {
        if (!isViewed) {
            let copyrightTime = 10
            let copyrightTimer = setInterval(() => {
                copyrightTime--
                document.querySelector("#copyrightOKBnt").innerHTML = `我已了解(${copyrightTime})`
                if (copyrightTime == 0) {
                    clearInterval(copyrightTimer)
                }
            }, 1000);
            document.querySelector("#copyrightNotice").style.display = "block"
            document.querySelector("#copyrightOKBnt").addEventListener("click", () => {
                if (copyrightTime == 0) {
                    document.querySelector("#copyrightNotice").style.display = "none"
                    localforage.setItem("viewedCopyright", true)
                }
            })
        }
    }
    )
}

if (navigator.serviceWorker != null) {
    navigator.serviceWorker.register('sw.js')
        .then(function (registration) {
            console.log('Registered events at scope: ', registration.scope);
        });
}

function showEmoji() {
        document.getElementById("emoji").style.display = "block"
}

function htmlspecialchars(str) {
    str = String(str)

    str = str.allReplace("&", "&amp")
    str = str.allReplace("<", "&lt")
    str = str.allReplace(">", "&gt")
    str = str.allReplace('"', "&quot")
    str = str.allReplace("'", "&apos")
    return str;
}

String.prototype.allReplace = function (str, toStr) {
    let oriStr = this
    let num = 0
    let replace = () => {
        if (oriStr != oriStr.replace(str, toStr)) {
            num++
            oriStr = oriStr.replace(str, toStr)
            replace()
        }
    }

    replace()
    return oriStr
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

function preload(url, index) {
    return new Promise(function (resolve, reject) {
        localforage.getItem(url)
            .then(file => {
                let fileOK = function () {
                    //检测file类型
                    if (file.type.indexOf("audio") != -1) {
                        let musicObj_ = new musicObj(URL.createObjectURL(file))
                        audioRes.push(musicObj_)
                    }
                    else if (file.type.indexOf("zip") != -1) {
                        let zip = new JSZip()
                        zip.loadAsync(file).then(function (zip) {
                            zip.forEach(function (relativePath, file) {
                                file.async("blob").then(function (content) {
                                    emoji[relativePath] = content
                                    let emojiE = document.createElement("img")
                                    emojiE.src = URL.createObjectURL(content)
                                    emojiE.className = "emojiListItem"
                                    emojiE.addEventListener("click", () => {
                                        document.getElementById("chatInputText").value += `#{${relativePath}}`
                                    })
                                    document.getElementById("emojiList").appendChild(emojiE)
                                })

                            })
                        })
                    }
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
                    xhr.open("GET", "https://feiesource.oss-cn-hangzhou.aliyuncs.com" + url, true);
                    xhr.send();
                } else { fileOK() }
            })
    })
}





function playAudio(audio) {
    audioRes[resToGet.indexOf(audio)].play()
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


function setProgressBar(now, total, objId) {
    let progress = document.getElementById(objId)
    progress.ariaValueMax = Math.floor(total)
    progress.ariaValueNow = Math.floor(now)
    progress.style.width = String(Math.floor(now) / Math.floor(total) * 100 + "%")
}

const createRamColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`


console.log(window.navigator.userAgent);
console.log(window.devicePixelRatio);
!function (N, M) {
    function L() {
        var a = I.getBoundingClientRect().width;
        a / F > 540 && (a = 540 * F);
        var d = a / 10;
        I.style.fontSize = d + "px", D.rem = N.rem = d
    }

    var K, J = N.document, I = J.documentElement, H = J.querySelector('meta[name="viewport"]'),
        G = J.querySelector('meta[name="flexible"]'), F = 0, E = 0, D = M.flexible || (M.flexible = {});
    if (H) {
        console.warn("将根据已有的meta标签来设置缩放比例");
        var C = H.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        C && (E = parseFloat(C[1]), F = parseInt(1 / E))
    } else {
        if (G) {
            var B = G.getAttribute("content");
            if (B) {
                var A = B.match(/initial\-dpr=([\d\.]+)/), z = B.match(/maximum\-dpr=([\d\.]+)/);
                A && (F = parseFloat(A[1]), E = parseFloat((1 / F).toFixed(2))), z && (F = parseFloat(z[1]), E = parseFloat((1 / F).toFixed(2)))
            }
        }
    }
    if (!F && !E) {
        var y = N.navigator.userAgent, x = (!!y.match(/android/gi), !!y.match(/iphone/gi)),
            w = x && !!y.match(/OS 9_3/), v = N.devicePixelRatio;
        F = x && !w ? v >= 3 && (!F || F >= 3) ? 3 : v >= 2 && (!F || F >= 2) ? 2 : 1 : 1, E = 1 / F
    }
    if (I.setAttribute("data-dpr", F), !H) {
        if (H = J.createElement("meta"), H.setAttribute("name", "viewport"), H.setAttribute("content", "initial-scale=" + E + ", maximum-scale=" + E + ", minimum-scale=" + E + ", user-scalable=no"), I.firstElementChild) {
            I.firstElementChild.appendChild(H)
        } else {
            var u = J.createElement("div");
            u.appendChild(H), J.write(u.innerHTML)
        }
    }
    N.addEventListener("resize", function () {
        clearTimeout(K), K = setTimeout(L, 300)
    }, !1), N.addEventListener("pageshow", function (b) {
        b.persisted && (clearTimeout(K), K = setTimeout(L, 300))
    }, !1), "complete" === J.readyState ? J.body.style.fontSize = 12 * F + "px" : J.addEventListener("DOMContentLoaded", function () {
        J.body.style.fontSize = 12 * F + "px"
    }, !1), L(), D.dpr = N.dpr = F, D.refreshRem = L, D.rem2px = function (d) {
        var c = parseFloat(d) * this.rem;
        return "string" == typeof d && d.match(/rem$/) && (c += "px"), c
    }, D.px2rem = function (d) {
        var c = parseFloat(d) / this.rem;
        return "string" == typeof d && d.match(/px$/) && (c += "rem"), c
    }
}(window, window.lib || (window.lib = {}));


document.getElementById("chatInputText").addEventListener("focus", () => {
    document.onkeydown = function (e) {
        if (e.key == "Enter" && document.getElementById("chatInputText").value != "") {
            ws.send(JSON.stringify(["chat", factionNow, document.getElementById("chatInputText").value]))
            document.getElementById("chatInputText").value = ""
        }
    }
})
document.getElementById("chatInputText").addEventListener("focusout", () => {
    document.onkeydown = null
})
function sendMsg(){
    ws.send(JSON.stringify(["chat", factionNow, document.getElementById("chatInputText").value]))
    document.getElementById("chatInputText").value = ""

}