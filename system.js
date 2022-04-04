"use strict"

if (navigator.serviceWorker != null) {
    navigator.serviceWorker.register('sw.js')
    .then(function(registration) {
      console.log('Registered events at scope: ', registration.scope);
    });
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
                    xhr.open("GET", "https://feiesource.oss-cn-hangzhou.aliyuncs.com"+url, true);
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