(function () {
    const searchField = document.getElementsByClassName('searchAnim')[0];
    const formElement = document.getElementById('searchForm');
    const urlParams = new URLSearchParams(window.location.search);

    const searchReg = /\w/ig;

    let queryWithSearch = '';
    searchField.addEventListener('keyup', () => {
        let searchVal = '';
        if (searchField.value.match(searchReg)) {
            searchVal = searchField.value.match(searchReg).join('').toLowerCase();
        }
        if (urlParams != '') {
            queryWithSearch = urlParams + `&search=${searchVal}`
        } else {
            queryWithSearch = `search=${searchVal}`
        }
    })

    formElement.addEventListener('submit', () => {
        formElement.action = `/animations?${queryWithSearch}`;
    })
})()