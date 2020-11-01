import {anyErrorsExist} from "../validations/validationDisplayer.js"

async function saveEverything(link, drawing, data) {
    console.log(drawing);

    if (anyErrorsExist(data) && mustBeGuessed.checked) {
        drawMessage('error', 'Please check fields before submitting');
        return;
    }
    //save click cooldown 
    if (drawing.frames.length > 0) {
        if (drawing.size <= 8) {
            let data = {
                frames: drawing.frames,
                thumbnail: drawing.frames[0],
                clipboard: drawing.clipboard,
                playSpeed: drawing.animationFrames,
                colorCollections: drawing.colorCollections,
                guessString: drawing.guessString,
                allowedGuesses: drawing.allowedGuesses,
                needsGuessing: drawing.needsGuessing,
                congratulationsMessage: drawing.congratulationsMessage
            }
            try {
                let response = await fetch(link, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow',
                    body: JSON.stringify(data),
                })
                response.json().then(data => {
                    drawMessage(data.type, data.message);
                })
            } catch (err) {
                console.log(err.message)
                // drawMessage('error', 'uhh');
            }
        } else {
            drawMessage('error', 'Not able to save due to heaviness of your file')
        }
    } else {
        drawMessage('error', 'Animation can not be empty')
    }
}

export {saveEverything}