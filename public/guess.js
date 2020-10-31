(function () {
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
                handleSuccessResponse(json, button);
            } catch (err) {
                console.log(err);
            }
        })
    })

    const showErrorMessage = (json, attemptResultMessageElement) => {
        clearClasses(attemptResultMessageElement);
        if (json.guessStatus == 'success' ||
            json.guessStatus == 'completed' ||
            json.guessStatus == 'continue') {
                attemptResultMessageElement.classList.add('success');
        } else {
            attemptResultMessageElement.classList.add('fail');
        }
        attemptResultMessageElement.innerText = json.message;
        setTimeout(() => {
            attemptResultMessageElement.classList.add('hide');
        }, 10000)

    }

    const clearClasses = (attemptResultMessageElement) => {
        attemptResultMessageElement.classList.remove('fail');
        attemptResultMessageElement.classList.remove('success');
        attemptResultMessageElement.classList.remove('hide');
    }

    const handleSuccessResponse = (json, buttonHTMLElement) => {
        const attemptResultMessageElement = buttonHTMLElement.parentElement.querySelector('.guess-attempt-result');

        switch (json.guessStatus) {
            case 'loginfail':
                drawMessage('error', 'You must be logged in to guess');
                break;
            default:
                showErrorMessage(json, attemptResultMessageElement);
        }
    }

}
)()