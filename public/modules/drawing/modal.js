(function () {
    const modalButtons = document.querySelectorAll('[data-modal-target]');
    const modalsClose = document.querySelectorAll('[data-close-modal]');
    const overlay = document.getElementById('overlay');

    modalButtons.forEach(button => {
        button.addEventListener('pointerup', () => {
            const modal = document.querySelector(button.dataset.modalTarget)
            openModal(modal);
        })
    })

    modalsClose.forEach(button => {
        button.addEventListener('pointerup', () => {
            const modal = button.closest('#modalGlobal');
            closeModal(modal);
        })
    })

    function openModal(modal) {
        if (modal) {
            // validateCongratulations();
            // validateGuess();
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

})()