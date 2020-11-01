import ValidationItem from "../validations/validationItem.js";
import { checkers } from "../validations/validator.js"
import {
    handleDisplayedErrors,
    checkLimits,
    checkRegExp,
    checkEmail,
    compareField2against1,
    checkBeforeFormTrigger,
    checkBeforeButtonPress,
    anyErrorsExist,
    checkAll
} from "../validations/validationDisplayer.js"
import SCRATCHPAD from "../../scratchpad.js"
import { saveEverything } from "./save.js"


let drawing = SCRATCHPAD.drawing;
const animation = SCRATCHPAD.animation;

const DRAW_VALIDATIONS = (function () {

    // const form = document.getElementById('registrationForm');
    const congratulationMessage = document.getElementById('congratulationMessage')
    const maxGuessAttempts = document.getElementById('maxGuessAttempts');
    const mustBeGuessed = document.getElementById('mustBeGuessed');
    const secretWord = document.getElementById('secretWord');

    congratulationMessage.value = drawing.congratulationsMessage || '';
    maxGuessAttempts.value = drawing.allowedGuesses;
    mustBeGuessed.checked = drawing.needsGuessing;

    let canSave = true;
    let errorsExist = false;
    const saveDraftButtons = document.querySelectorAll("[data-save-draft]");
    const savePostButtons = document.querySelectorAll("[data-save-post]");





    const data = [
        {
            field: document.getElementById('congratulationMessage'),
            errorElement: document.getElementById('congratulationMessage').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Message',
                    itemValue: drawing.congratulationsMessage,
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 0,
                    maxValue: 100
                }
            )
        },
        {
            field: document.getElementById('secretWord'),
            errorElement: document.getElementById('secretWord').parentElement.querySelector('.invalid-feedback'),
            data: new ValidationItem(
                {
                    validationName: 'Secret word',
                    itemValue: drawing.guessString,
                    itemType: 'string',
                    canBeEmpty: false,
                    minValue: 1,
                    maxValue: 50
                }, null, /\w{1,50}/g
            )
        }
    ]
    

    const checkForm = (dataElement) => {
        if (mustBeGuessed.checked) {
            checkers.initChecker(dataElement.data)
            switch (dataElement.data.validationName) {
                case 'Secret word':
                    drawing.guessString = dataElement.data.itemValue;
                    checkLimits(dataElement.data);
                    checkRegExp(dataElement.data);
                    break;
                case 'Message':
                    drawing.congratulationsMessage = dataElement.data.itemValue;
                    checkLimits(dataElement.data);
            }
        } else {
            data.forEach(validationItem => {
                checkers.resetErrors(validationItem.data);
                handleDisplayedErrors(validationItem);
            })
        }
    }

    const checkOnLoad = () => {
        data.forEach(validationItem => {
            checkForm(validationItem);
            handleDisplayedErrors(validationItem);
        })
    }
    checkOnLoad();

    function mustBeGuessedIsChecked() {
        if (!mustBeGuessed.checked) {
            drawing.needsGuessing = false;
            maxGuessAttempts.disabled = true;
            secretWord.disabled = true;
            congratulationMessage.disabled = true;
            data.forEach(validationItem => {
                console.log(validationItem);
                checkers.resetErrors(validationItem.data);
            })
        } else {
            drawing.needsGuessing = true;
            maxGuessAttempts.disabled = false;
            secretWord.disabled = false;
            congratulationMessage.disabled = false;
            checkAll(data);
        }
    }
    mustBeGuessedIsChecked()

    mustBeGuessed.addEventListener('change', () => {
        mustBeGuessedIsChecked();
    })

    saveDraftButtons.forEach(button => {
        button.addEventListener('mouseup', (e) => {
            if ((!anyErrorsExist(data) && mustBeGuessed.checked) || !mustBeGuessed.checked) {
                saveEverything('/animations/' + animation._id, drawing, data);
            } else {
                drawMessage('error', 'Please check fields in global settings');
                e.stopPropagation();
            }
        })
    })

    savePostButtons.forEach(button => {
        button.addEventListener('mouseup', (e) => {
            if ((!anyErrorsExist(data) && mustBeGuessed.checked) || !mustBeGuessed.checked) {
                let link = '/animations/' + animation._id + '?post=1'
                saveEverything(link, drawing, data); //post = 1 tells backend this is not draft version to be saved
            } else {
                drawMessage('error', 'Please check fields in global settings');
                e.stopPropagation();
            }
        })
    })

    //handling save button behavior based on whether errors are found

    // saveDraftButtons.forEach(button => {
    //     checkBeforeButtonPress(data, button)
    // })

    // savePostButtons.forEach(button => {
    //     checkBeforeButtonPress(data, button)
    // })

    //==============

    data.forEach(dataElement => {
        dataElement.field.addEventListener('keyup', (e) => {
            dataElement.data.itemValue = e.target.value;
            checkForm(dataElement);
            handleDisplayedErrors(dataElement);
        })
    })

    return {};
})()
export default DRAW_VALIDATIONS;