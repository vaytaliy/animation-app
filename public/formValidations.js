(function registrationValidation() {

    const form = document.getElementById('registrationForm')
    const stringTrimmer = /\W/g;
    const stringRule = /^[a-zA-Z]\w{2,29}/g; //max length 30
    const submitBtn = form.querySelector('#submitButton');
    const formInputs = form.querySelectorAll('input:not([type="hidden"])');
    let originalPasswordNode = document.getElementById('originalPass');
    let repeatedPasswordNode = document.getElementById('repeatedPassword');
    const MIN_PASS_LENGTH = 5
    const MAX_PASS_LENGTH = 50;

    let checkItems = {
        username: document.getElementById('username'),
        email: document.getElementById('emailInput'),
        password: document.getElementById('originalPass')
    }

    let errors = [];

    if (form) {
        formInputs.forEach(formInput => {
            formInput.addEventListener('keyup', (e) => {
                switch (e.target.id) {
                    case ('emailInput'):
                        checkEmail(e.target);
                        break;
                    case ('originalPass'):
                        checkPassword();
                        break;
                    case ('repeatedPassword'):
                        checkPassword();
                        break;
                    case ('username'):
                        checkUsername(e.target);
                }
            })
        })
    }

    const formCheck = () => {
        checkEmail(checkItems.email);
        checkPassword(checkItems.password);
        checkUsername(checkItems.username);
    }

    const checkEmail = (emailInput) => {
        let positionOfError = checkErrorExists('email');
        if (emailInput.checkValidity() && notEmptyValue(emailInput)) {
            removeError(positionOfError, 'email');
            hideErrors([emailInput]);
        } else {
            appendError('email');
            displayErrors([emailInput]);
        }
    }

    const checkUsername = (usernameInput) => {
        let positionOfError = checkErrorExists('username');
        if (isNotBlank(usernameInput)) {
            if (!goodLength(usernameInput, 30, 3)) {
                setNewErrorMessage(usernameInput, `Username length is between ${1} and ${30}`);
                appendError('username');
                displayErrors([usernameInput]);
                return;
            }
            if (!attestsToRules(usernameInput)) {
                setNewErrorMessage(usernameInput, `Illegal name format, try example: "jerry_14" "monst8r_a1"`);
                appendError('username');
                displayErrors([usernameInput]);
                return;
            }
        }
        if (!isNotBlank(usernameInput)) {
            setNewErrorMessage(usernameInput, `Nickname must not be blank and starts with latin letter`);
            appendError('username');
            displayErrors([usernameInput]);
            return;
        }
        removeError(positionOfError, 'username');
        hideErrors([usernameInput]);
        return;
    }

    const checkPassword = () => {

        let positionOfError = checkErrorExists('password1');


        if (isNotBlank(originalPasswordNode)) {
            if (!goodLength(originalPasswordNode, MAX_PASS_LENGTH, MIN_PASS_LENGTH)) {
                setNewErrorMessage(originalPasswordNode, `Password's length must be between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH}`);
                appendError('password1');
                displayErrors([originalPasswordNode]);
                return;
            }
            if (!comparePasswords(originalPasswordNode, repeatedPasswordNode)) {
                setNewErrorMessage(originalPasswordNode, "Original and repeated passwords don't match");
                appendError('password1');
                displayErrors([originalPasswordNode]);
                return;
            }
        }

        if (!isNotBlank(originalPasswordNode)) {
            setNewErrorMessage(originalPasswordNode, "Password can't be empty");
            appendError('password1');
            displayErrors([originalPasswordNode]);
            return;
        }
        removeError(positionOfError, 'password1');
        hideErrors([originalPasswordNode]);
        return;
    }

    const attestsToRules = (inputNode) => {
        if (inputNode && inputNode.value && inputNode.value.match(stringRule) && inputNode.value == inputNode.value.match(stringRule).toString()) {
            return true;
        }
        return false;
    }

    const isNotBlank = (passwordInput) => {
        if (passwordInput && passwordInput.value && passwordInput.value != '') {
            return true;
        }
        return false;
    }

    const setNewErrorMessage = (inputNode, newMessage) => {
        if (inputNode) {
            inputNode.parentElement.querySelector('.invalid-feedback').innerText = newMessage;
        }
    }

    const goodLength = (inputNode, maxVal, minVal) => {
        if (inputNode && inputNode.value && inputNode.value.length >= minVal && inputNode.value.length <= maxVal) {
            return true;
        }
        return false;
    }

    const comparePasswords = (originalPassword, repeatedPassword) => {
        if (originalPassword.value === repeatedPassword.value) {
            return true;
        }
        return false;
    }

    const notEmptyValue = (targetedInput) => {
        if (targetedInput.value && targetedInput.value !== '') {
            return true;
        }
        return false;
    }

    const hideErrors = (targetedInputs) => {
        targetedInputs.forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        })
    }

    const displayErrors = (targetedInputs) => {
        targetedInputs.forEach(input => {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        })
    }

    const checkErrorExists = (searchedError) => {
        return errors.indexOf(searchedError) != -1 ? errors.indexOf(searchedError)
            : -1
    }

    const removeError = (indexPosition, errorName) => {
        if (errors[indexPosition] == errorName && indexPosition != -1) {
            errors.splice(indexPosition, 1);
        }
    }

    const appendError = (errorName) => {
        let errIndex = checkErrorExists(errorName);
        if (errIndex == -1) {
            errors.push(errorName);
        }
    }

    form.addEventListener('submit', (e) => {
        formCheck();
        if (errors.length > 0) {
            e.preventDefault();
        }
    })
}

)()

//current checks
//=============

// - username (only latin symbols or numbers). min length 3, max length 15;
// - password (min length 3, max length 20)
// - registration validation of password repeat
// - make everything we receive into string on backend (just in case)
// - animation name (min - 2, max 65)
// - animation description (min - 0, max - 400)
// - guess word (min-0, max 50, only latin symbols and numbers - ignore spaces, other characters)
// - allowed guesses number (if guess word is defined)   (min - 1, max- 50)

//=============