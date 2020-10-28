import ValidationItem from "./../validations/validationItem.js";
import { checkItem, checkRegExp, initChecker, emailValidator, passwordValidator } from "./../validations/validator.js"
import { handleDisplayedErrors } from "./../validations/validationDisplayer.js"

const REG = (function () {

    const data = [
        {
            field: document.getElementById('username'),
            errorElement: document.getElementById('username').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Username',
                    itemValue: 'g',
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

//"checkItem" function is a basic standardized validator for any kind of input fields

    data.forEach(dataElement => {
        dataElement.field.addEventListener('keyup', (e) => {
            initChecker(dataElement.data)
            dataElement.data.itemValue = e.target.value;
            let validationItemData = dataElement.data;
            switch (validationItemData.validationName) {
                case 'Username':
                    checkItem(validationItemData);
                    checkRegExp(validationItemData);
                    break;
                case 'Email':
                    emailValidator(validationItemData, dataElement.field);
                    break;
                case 'Password1':
                    checkItem(validationItemData);
                    break;
                case 'Password2':
                console.log(validationItemData + ":" + data[2].data)    
                passwordValidator(validationItemData, data[2].data);
                break;
            }
            handleDisplayedErrors(dataElement);
        })
    })

    return data;
})()
export default REG;