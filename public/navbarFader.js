function initFader() {

    let navbar = document.querySelector('nav');
    let els = [];
    let hidden = false;
    let navbarTogglerUsed = false;
    let collapsedComment = document.querySelector('.navbar-collapse');

    document.addEventListener('pointerdown', (e) => {
        if (e.target && e.target.classList.contains('navbar-toggler')
            || e.target.classList.contains('navbar-toggler-icon')
            || e.target.classList.contains('nav-link')
            || e.target.nodeName == 'BUTTON') {
            navbarTogglerUsed = true;
        }
        else {
            navbarTogglerUsed = false;
            collapsedComment.classList.remove('show');
        }
    })

    document.addEventListener('scroll', (e) => {
        if (!navbarTogglerUsed) {
            if (els.length < 2) {
                els.push(window.scrollY)
            } else {
                els.shift()
                els.push(window.scrollY)
            }
            navbar.style.zIndex = '33'
            if (els[1] - els[0] > 0) { 
                navbar.style.animationName = 'fadeout';
                document.addEventListener('animationend', (e) => {
                    navbar.style.zIndex = '33'
                    navbar.animationName = '';
                    navbar.style.opacity = 0;
                    navbar.style.zIndex = -1;
                    hidden = true;
                })

            } else {
                navbar.style.animationName = 'fadein';
                document.addEventListener('animationend', (e) => {
                    navbar.style.zIndex = '33'
                    navbar.animationName = '';
                    navbar.style.opacity = 1;
                    hidden = false;
                })
            }
        }
    })
}
initFader()