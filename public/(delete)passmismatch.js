
function main() {

    let mismatch = false;

    let originalPass = document.getElementById('originalPass');
    let repeatPass = document.getElementById('repeatPass');


    function checkMismatch() {

        originalPass.addEventListener('keyup', (e) => {
            if (e) {
                if (e.target.value != repeatPass.value) {
                    console.log('mismatch')
                    originalPass.style.outlineStyle = "solid";
                    originalPass.style.outlineColor = "red";
                    mismatch = true;
                } else {
                    originalPass.style.outlineStyle = "none";
                    originalPass.style.outlineColor = "black";
                    mismatch = false;
                }
            }
        })

        repeatPass.addEventListener('keyup', (e) => {
            if (e) {
                if (e.target.value != originalPass.value) {
                    console.log('mismatch')
                    originalPass.style.outlineStyle = "solid";
                    originalPass.style.outlineColor = "red";
                    mismatch = true;
                } else {
                    originalPass.style.outlineStyle = "none";
                    originalPass.style.outlineColor = "black";
                    mismatch = false;
                }
            }
        })
    };

    checkMismatch()

    function checkEmpty() {
        if (originalPass.value.length == 0 || repeatPass.value.length == 0) {
            return true;
        } else {
            return false;
        }
    }

    let button = document.getElementById('submitButton');
    button.addEventListener('poinerup', (e) => {
        if (e) {
            preventMismatchSubmit();
        }
    })

    function preventMismatchSubmit() {
        if (checkEmpty() || mismatch) {
            button.innerText = "cant send"
        }
    }
}

main();