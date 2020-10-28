
export const handleDisplayedErrors = (validationItem) => {
    const field = validationItem.field;
    const errorDisplayElement = validationItem.errorElement;

    if (validationItem.data.errorMessage) {
        errorDisplayElement.innerText = validationItem.data.errorMessage;
        field.classList.remove('is-valid');     
        field.classList.add('is-invalid');         
    } else {
        field.classList.remove('is-invalid');  
        field.classList.add('is-valid');     
    }
}