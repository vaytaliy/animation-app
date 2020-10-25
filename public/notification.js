const drawMessage = (type, message) => {
    let msgBox = document.getElementsByClassName('save-alert')[0];
    msgBox.classList.remove('hidden');
    msgBox.classList.remove('success');
    msgBox.classList.remove('error');
    msgBox.classList.add(type)
    msgBox.innerText = message;
    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 1000)
}