function init() {
    const allButtons = document.querySelectorAll('.guess-button');

    allButtons.forEach(button => {
        button.addEventListener('click', async (e) => {

            const guessInput = button.parentElement.querySelector('.guess-input');
            let guessInputValue = guessInput.value;

            try {
                const response = await fetch('api/guess/' + button.dataset.animationid, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        guessInput: guessInputValue
                    })
                })
                guessInput.value = '';
                console.log(response);
                const json = await response.json();
                console.log(json)
                
            } catch (err) {
                console.log(err);
            }
        })
    })
}

init();