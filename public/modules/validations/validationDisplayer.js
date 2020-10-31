import { checkers } from "./../validations/validator.js"

const handleDisplayedErrors = (validationItem) => {
    const field = validationItem.field;
    const errorDisplayElement = validationItem.errorElement;

    if (validationItem.data.errorMessage) {
        errorDisplayElement.innerText = validationItem.data.errorMessage;
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        validationItem.data.hasError = true;
    } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        validationItem.data.hasError = false;
    }
}

const checkLimits = (validationItem) => {
    checkers.checkItemEmpty(validationItem);
    checkers.checkValueBelowMin(validationItem);
    checkers.checkValueAboveMax(validationItem);
}

const checkRegExp = (validationItem) => {
    checkers.checkRegExp(validationItem);
}

const checkEmail = (dataElement) => {
    checkers.emailValidator(dataElement.data, dataElement.field);
}

const compareField2against1 = (comparedElement, thisElement) => {
    checkers.passwordValidator(comparedElement, thisElement);
}

const checkAll = (data) => {
    data.forEach(dataElement => {
        checkLimits(dataElement.data);
        handleDisplayedErrors(dataElement);
    })
}

const anyErrorsExist = (data) => {
    checkAll(data);
    for (let item of data) {
        if (item.data.hasError) {
            return true;
        }
    }
    return false;
}

const checkBeforeFormTrigger = (data, formHTMLelement) => {
    formHTMLelement.addEventListener('submit', (e) => {
        if (anyErrorsExist(data)) {
            e.preventDefault();
        }
    })
}

const checkBeforeButtonPress = (data, buttonHTMLElement) => {
    buttonHTMLElement.addEventListener('pointerup', (e) => {
        if (anyErrorsExist(data)) {
            e.stopPropagation();
        }
    })
}

export { handleDisplayedErrors, 
    checkLimits, 
    checkRegExp, 
    checkEmail, 
    compareField2against1, 
    checkBeforeFormTrigger,
    checkBeforeButtonPress }