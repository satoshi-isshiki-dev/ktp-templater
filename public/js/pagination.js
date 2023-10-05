let pageNumber = 1
let htmlPageNum = document.querySelector(".pageNum")
let page1 = document.querySelector("#separation1")
let page2 = document.querySelector("#separation2")
let page3 = document.querySelector("#separation3")
let htmlNextPageBtn = document.querySelector(".nextPageBtn")
// let htmlDoGood = document.querySelector(".doGood")
let body = document.querySelector(".body")
let entryBlock = document.querySelector(".entry-block")
let previousPageBtn = document.querySelector(".previousPageBtn")
let weekDays = document.querySelector(".weekDays")

function nextPage() {
    if (pageNumber == 1) {
        page1.classList.toggle("sep1")
        page2.classList.toggle("sep2")
    }
    else if (pageNumber == 2) {
        page2.classList.toggle("sep2")
        page3.classList.toggle("sep3")
    }
    if (pageNumber < 3) {
        pageNumber += 1
    }
    htmlPageNum.innerHTML = `${pageNumber}`
    console.log(pageNumber);
}

function previousPage() {
    if (pageNumber == 3) {
        page3.classList.toggle("sep3")
        page2.classList.toggle("sep2")
        htmlNextPageBtn.classList.toggle("hide")
    }
    else if (pageNumber == 2) {
        page2.classList.toggle("sep2")
        page1.classList.toggle("sep1")
    }
    if (pageNumber>1) {
        pageNumber -= 1
    }
    htmlPageNum.innerHTML = `${pageNumber}`
    console.log(pageNumber);
}