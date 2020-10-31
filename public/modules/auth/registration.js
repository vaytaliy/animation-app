import ValidationItem from "./../validations/validationItem.js";
import { checkers } from "./../validations/validator.js"
import { handleDisplayedErrors, 
    checkLimits, 
    checkRegExp, 
    checkEmail, 
    compareField2against1, 
    checkBeforeFormTrigger,
    checkBeforeButtonPress } from "./../validations/validationDisplayer.js"

const REG = (function () {

    //currently existing types of inputs: normal (can )

    const form = document.getElementById('registrationForm');

    const data = [
        {
            field: document.getElementById('username'),
            errorElement: document.getElementById('username').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Username',
                    itemValue: '',
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 3,
                    maxValue: 30
                }, null, /^[a-zA-Z]\w{2,29}/g
            )
        },
        {
            field: document.getElementById('emailInput'),
            errorElement: document.getElementById('emailInput').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Email',
                    itemValue: '',
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 1,
                    maxValue: 50
                }
            )
        },
        {
            field: document.getElementById('originalPass'),
            errorElement: document.getElementById('originalPass').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Password1',
                    itemValue: '',
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 5,
                    maxValue: 50
                }
            )
        },
        {
            field: document.getElementById('repeatedPassword'),
            errorElement: document.getElementById('repeatedPassword').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Password2',
                    itemValue: '',
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 5,
                    maxValue: 50
                }
            )
        }
    ]


    const checkForm = (dataElement) => {
        checkers.initChecker(dataElement.data)
        switch (dataElement.data.validationName) {
            case 'Username':
                checkLimits(dataElement.data);
                checkRegExp(dataElement.data);
                break;
            case 'Email':
                checkLimits(dataElement.data);
                checkEmail(dataElement);
                break;
            case 'Password1':
                checkLimits(dataElement.data);
                break;
            case 'Password2':
                checkLimits(dataElement.data);
                compareField2against1(dataElement.data, data[2].data);
                break;
        }
    }

     checkBeforeFormTrigger(data, form)

    data.forEach(dataElement => {
        dataElement.field.addEventListener('keyup', (e) => {
            dataElement.data.itemValue = e.target.value;
            checkForm(dataElement);
            handleDisplayedErrors(dataElement);
        })
    })

    return {};
})()
export default REG;