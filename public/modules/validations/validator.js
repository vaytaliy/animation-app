// import ValidationItem from './validationItem.js'

//the order of error checks matters

const resetErrors = (validationItem) => {
    Object.keys(validationItem.errors).forEach(error => {
        validationItem.errors[error] = false;
    })
}

const initChecker = (validationItem) => {
    validationItem.errorMessage = null;  //erase error message because not checked for new errors;
    resetErrors(validationItem);
}

const makeErrorMessage = (validationItem, newMessage) => {
    validationItem.errorMessage = `${validationItem.validationName} ${newMessage}`;
}



const checkItem = (validationItem) => {
    if (validationItem.validateValueIsEmpty()) {
        if (validationItem.validateCanBeEmpty()) {
            validationItem.errors.empty = false;
        } else {
            validationItem.errors.empty = true;
            makeErrorMessage(validationItem, `can't be blank`);
            return;
        }
    }

    if (validationItem.valueBelowMin()) {
        validationItem.errors.minValue = true;
        makeErrorMessage(validationItem, `is too short`);
        return;
    } else {
        validationItem.errors.minValue = false;
    }
    if (validationItem.valueAboveMax()) {
        validationItem.errors.maxValue = true;
        makeErrorMessage(validationItem, `is too long`);
        return;
    } else {
        validationItem.errors.maxValue = false;
    }
}

const checkRegExp = (validationItem) => {
    if (!validationItem.errors.minValue) {      //Not checking reg exp if value is too short
        if (validationItem.validateValueMatchesFullRegExpMatch()) {
            validationItem.errors.regexp = false;
        } else {
            validationItem.errors.regexp = true;
            makeErrorMessage(validationItem, `contains illegal symbols`);
            return;
        }
    }
    return;
}

const passwordValidator = (passwordItem, repeatItem) => {
    if (passwordItem.validatePasswordMatch(repeatItem)) {
        passwordItem.errors.mismatch = false;
        
    } else {
        passwordItem.errors.mismatch = true;
        makeErrorMessage(passwordItem, `doesn't match repeated password`);
    }
}

const emailValidator = (emailItem, field) => {
    if (field.checkValidity()) {
        emailItem.errors.email = false;
       
    } else {
        emailItem.errors.email = true;
        makeErrorMessage(emailItem, `incorrect email format`);
    }
}

export { checkItem, passwordValidator, emailValidator, checkRegExp, initChecker };