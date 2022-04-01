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