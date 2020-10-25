function dateParserInit() {

    let postDates = document.getElementsByClassName('date')

    for (postDate of postDates) {
        let dateToSend = new Date(Date.parse(postDate.dataset.date)).toDateString()
        postDate.innerText = dateToSend.substr(4, dateToSend.length);
    }
}

window.onload = dateParserInit();