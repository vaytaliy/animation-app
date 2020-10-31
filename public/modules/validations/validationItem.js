/* validation item is as follows
* validation_name: password, username, guess, secret word
* error message 
* success message ('optional')
* max-length
* min-length
* regexp
* canBeEmpty
* itemType - string, number
*
*
*
*/

class ValidationItem {
    constructor({
        validationName,
        itemValue,
        itemType,
        canBeEmpty = true,
        minValue = null,
        maxValue = null }, defaultErrorMessage = null, regexp = null) 
        {
        this.validationName = validationName;
        this.itemValue = itemValue || '';
        this.itemType = itemType;
        this.errorMessage = defaultErrorMessage;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.regexp = regexp;
        this.canBeEmpty = canBeEmpty;
        this.errors =
        {
            empty: false,
            regex: false,
            minValue: false,
            maxValue: false,
            mismatch: false,
            email: false
        };
        this.hasError = false;
    }

    validateValueIsEmpty() {
        return this.itemValue.length == 0 ? true : false;
    }

    validateCanBeEmpty() {
        return this.itemValue.canBeEmpty;
    }

    throwTypeError() {
        throw new SyntaxError(`Incorrect type of validation item: ${this.itemType}`);
    }

    valueBelowMin() {
        if (this.minValue) {
            if (this.itemType == 'number') {
                return this.itemValue < this.minValue ? true : false;
            } else if (this.itemType == 'string') {
                return this.itemValue.length < this.minValue ? true : false;
            } else {
                this.throwTypeError();
            }
            return false;
        }
        return false;
    }

    valueAboveMax() {
        if (this.maxValue) {
            if (this.itemType == 'number') {
                return this.itemValue > this.maxValue ? true : false;
            } else if (this.itemType == 'string') {
                return this.itemValue.length > this.maxValue ? true : false;
            } else {
                this.throwTypeError();
            }
            return false;
        }
        return false;
    }

    validateValueMatchesFullRegExpMatch() {
        if (this.regexp && this.itemValue != '' && this.itemValue.length <= this.maxValue && this.itemType == 'string') {
            return this.itemValue.match(this.regexp) && this.itemValue == this.itemValue.match(this.regexp)[0] ? true : false;
        }
        return true;
    }

    validatePasswordMatch(anotherPasswordObj) {
        if (this.itemType == 'string' && anotherPasswordObj.itemType == 'string') {
            console.log(this.itemValue + ":" + anotherPasswordObj.itemValue)
            return this.itemValue == anotherPasswordObj.itemValue ? true : false;
        }
        this.throwTypeError();
    }
}

export default ValidationItem;