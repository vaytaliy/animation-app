//todo: fix damn mess

//Initializing everything
const SCRATCHPAD = (function () {
    const animationData = document.getElementById("animationData").value;
    const animation = JSON.parse(animationData);
    const originalFrames = animation.frames;

    const BRUSH_SIZE = 8,
        SELECTED_COLOR = "#000000",
        ACTIVE_FRAME = 1,
        MOVE_ENABLED = false,
        ANIMATION_FRAMES = animation.playSpeed,  //... frames per 10 seconds
        DEFAULT_BACKGROUND_COLOR = "#ffffff"

    let drawing = {
        selectedColor: SELECTED_COLOR,
        brushSize: BRUSH_SIZE,
        moveEnabled: MOVE_ENABLED,
        coverFrame: animation.coverFrame,
        animationFrames: ANIMATION_FRAMES,
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
        colorCollections: animation.colorCollections,
        frames: animation.frames,
        congratulationsMessage: animation.congratulationsMessage,
        guessString: animation.guessString,
        needsGuessing: animation.needsGuessing,
        allowedGuesses: animation.allowedGuesses,
        clipboard: animation.clipboard,
        history: [],
        size: 0
    }

    function putOriginalIntoHistory() {

        for (let i = 0; i < drawing.frames.length; i++) {
            drawing.history[i] = {
                histData: [drawing.frames[i]],
                entryPoint: 1
            }
        }
    }
    putOriginalIntoHistory();

    function checkDrawingSize() {

        let totalSize = 0;

        if (drawing.frames) {
            for (let frame of drawing.frames) {
                totalSize += (new TextEncoder().encode(frame)).length / 1000000
            }
            drawing.size = totalSize;
        }

        let result = Math.round(totalSize * 10) / 10;
        document.getElementById("drawingSize").innerText = result

    }

    checkDrawingSize()

    function handlePlaybackSpeed() {

        let slider = document.getElementById("sliderFrames")
        slider = drawing.animationFrames
        drawing.animationFrames = parseInt(slider)
        document.getElementById("fps").innerText = slider / 10 //cause this value is 10 times less than frame

        document.getElementById("sliderFrames").addEventListener('change', (e) => {
            drawing.animationFrames = parseInt(e.target.value)
            document.getElementById("fps").innerText = e.target.value / 10
        })

        let increaseSpeed = document.getElementById("increaseSpeed");
        let decreaseSpeed = document.getElementById("decreaseSpeed");

        increaseSpeed.addEventListener('mouseup', (e) => {
            let currentVal = document.getElementById("fps").innerText
            if (parseInt(currentVal) < 10) {
                let newVal = parseFloat(currentVal) + 0.1
                newVal = Math.round(newVal * 10) / 10
                document.getElementById("fps").innerText = newVal
                drawing.animationFrames = newVal * 10
                document.getElementById("sliderFrames").value = newVal * 10
            }
        })

        decreaseSpeed.addEventListener('mouseup', (e) => {
            let currentVal = document.getElementById("fps").innerText
            if (parseFloat(currentVal) > 0.1) {
                let newVal = parseFloat(currentVal) - 0.1
                newVal = Math.round(newVal * 10) / 10
                document.getElementById("fps").innerText = newVal
                drawing.animationFrames = newVal * 10
                document.getElementById("sliderFrames").value = newVal * 10
            }
        })

    }

    handlePlaybackSpeed()

    //submits frames to the server




    //init iro colorpicker library

    function initIro() {
        let colorPicker = new iro.ColorPicker("#colorWheelDemo", {
            width: 300
        })

        console.log(colorPicker);

        colorPicker.on('color:change', function (color) {
            drawing.selectedColor = color.hexString
        })

        let giveWhiteButton = document.getElementById("giveWhite");

        giveWhiteButton.addEventListener('mouseup', (e) => {
            colorPicker.color.hexString = "#ffffff";
            drawing.selectedColor = "#ffffff";
        })
        function createColorCollectionHandler() {

            let addToCollection = document.getElementById("addToCollection");
            let container = document.getElementById("colorCollection");
            let colorItems = document.querySelectorAll('.colorCollectionItem');
            let removeColorButton = document.getElementById('removeColor');

            addToCollection.addEventListener('pointerup', (e) => {
                if (drawing.colorCollections.length <= 50) {
                    let newColor = document.createElement('div');
                    newColor.classList.add('colorCollectionItem');
                    newColor.dataset.color = colorPicker.color.hexString
                    drawing.colorCollections.push(colorPicker.color.hexString);
                    newColor.style.backgroundColor = colorPicker.color.hexString;
                    container.appendChild(newColor);
                    //colorItems = document.querySelectorAll('.colorCollectionItem');
                }
            })

            document.addEventListener('pointerup', (e) => {
                if (e && e.target.classList.contains('colorCollectionItem')) {
                    drawing.selectedColor = e.target.dataset.color;
                    colorPicker.color.hexString = e.target.dataset.color;
                    document.querySelectorAll('.colorCollectionItem.selected').forEach(item => {
                        item.classList.remove('selected');
                    })
                    e.target.classList.add('selected')
                }
            })

            removeColorButton.addEventListener('pointerup', () => {
                let selectedColor = document.querySelectorAll('.colorCollectionItem.selected')[0];
                if (selectedColor) {
                    let colorCode = selectedColor.dataset.color;
                    for (let i = 0; i < drawing.colorCollections.length; i++) {
                        if (drawing.colorCollections[i] == colorCode) {
                            drawing.colorCollections.splice(i, 1);
                            break;
                        }
                    }
                    selectedColor.remove();
                }
            })

        }
        createColorCollectionHandler()
    }

    initIro()

    //init drawing canvas with event listeners

    function initCanvas() {
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        let frameInput = document.getElementById("frameSelector")
        let chosenFrame = parseInt(document.getElementById("frameSelector").value)
        let prevFrameImage = document.getElementById("image");

        function renderImage(currentFrame) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            let image = new Image();
            image.src = currentFrame;
            image.onload = () => {
                ctx.globalAlpha = 1
                ctx.drawImage(image, 0, 0);
            }
        }

        function setupInitial() {
            renderImage(drawing.frames[0]);
            document.getElementById('animationPlaybackSlider').max = drawing.frames.length;
            document.getElementById('sliderFrames').value = drawing.animationFrames;
            document.getElementById('drawClipboard');
            let container = document.getElementById("colorCollection");

            for (let i = 0; i < drawing.colorCollections.length; i++) {
                let newColor = document.createElement('div');
                newColor.classList.add('colorCollectionItem');
                newColor.dataset.color = drawing.colorCollections[i]
                newColor.style.backgroundColor = drawing.colorCollections[i];
                container.appendChild(newColor);
            }
            for (let i = 0; i < drawing.clipboard.length; i++) {
                let image = document.createElement('img');
                image.classList.add("clipboardImage")
                image.id = i;
                image.src = drawing.clipboard[i];
                drawClipboard.appendChild(image);
            }
        }

        setupInitial();

        function toggleBackgroundImage() {
            let hideBackground = document.getElementById("hideBackground");


            hideBackground.addEventListener('change', (e) => {
                if (e && e.target.checked) {
                    document.getElementById("image").style.display = "none"
                } else {
                    document.getElementById("image").style.display = "block"
                }
            })
        }

        toggleBackgroundImage()

        function renderBlankPage(selectedFrame) {
            ctx.fillStyle = drawing.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            let dataURL = canvas.toDataURL();
            drawing.frames[selectedFrame] = dataURL;

        }

        function createPreviousFrameImage(imgSource) {
            prevFrameImage.src = imgSource;
        }

        document.getElementById("nextFrame").addEventListener('pointerup', (e) => {

            if (e && frameInput.value < 999) {

                frameInput.value++



                chosenFrame = parseInt(frameInput.value)
                let currentFrame = drawing.frames[chosenFrame - 1]


                if (currentFrame) {

                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    prevFrameImage.src = currentFrame;
                    renderImage(currentFrame)
                }
                else {

                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                if (drawing.frames[chosenFrame - 2]) {
                    createPreviousFrameImage(drawing.frames[chosenFrame - 2])
                }

                // checking if the frame that we skipped was undefined, in that case we draw something

                if (!drawing.frames[chosenFrame - 2]) {
                    renderBlankPage(chosenFrame - 2)
                    //console.log("ye")
                }
                let animationPlaybackSlider = document.getElementById('animationPlaybackSlider');
                animationPlaybackSlider.max = drawing.frames.length + 1;
                initPlaybackSlider()
            }

        })

        document.getElementById("previousFrame").addEventListener('pointerup', (e) => {

            if (e && frameInput.value > 1) {

                frameInput.value -= 1

                chosenFrame = parseInt(frameInput.value)
                let currentFrame = drawing.frames[chosenFrame - 1]
                initPlaybackSlider()
                if (currentFrame) {

                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    prevFrameImage.src = currentFrame;
                    renderImage(currentFrame)
                }
                else {

                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                if (drawing.frames[chosenFrame - 2]) {
                    createPreviousFrameImage(drawing.frames[chosenFrame - 2])
                }
            }

        })

        function initPlaybackSlider() {

            let chosenFrame = parseInt(document.getElementById("frameSelector").value)
            let animationPlaybackSlider = document.getElementById('animationPlaybackSlider');
            animationPlaybackSlider.value = chosenFrame;
        }

        //init drawing handling

        function drawingHandling() {

            let lastX;
            let lastY;
            let pointerIsUp = true
            let multipleTouches = false
            let moveToolEnabled = false

            let parentDiv = document.getElementById('parentContainer')
            parentDiv.addEventListener("pointerdown", pointerDown);
            parentDiv.addEventListener("pointermove", pointerMove);
            parentDiv.addEventListener("pointerup", pointerUp);
            parentDiv.addEventListener("touchstart", prevent);
            parentDiv.addEventListener("touchmove", prevent);

            let moveTool = document.getElementById("moveTool");

            moveTool.addEventListener('change', (e) => {
                if (e) {
                    drawing.moveEnabled = moveTool.checked
                    if (moveTool.checked) {
                        parentDiv.removeEventListener("pointerdown", pointerDown);
                        parentDiv.removeEventListener("pointermove", pointerMove);
                        parentDiv.removeEventListener("pointerup", pointerUp);
                        parentDiv.removeEventListener("touchstart", prevent);
                        parentDiv.removeEventListener("touchmove", prevent);
                    }
                    else {
                        parentDiv.addEventListener("pointerdown", pointerDown);
                        parentDiv.addEventListener("pointermove", pointerMove);
                        parentDiv.addEventListener("pointerup", pointerUp);
                        parentDiv.addEventListener("touchstart", prevent);
                        parentDiv.addEventListener("touchmove", prevent);
                    }
                }
            })

            function pointerDown(e) {
                if ((e.target.id == "image" || e.target.id == "canvas") && !multipleTouches && !moveToolEnabled) {
                    pointerIsUp = false;
                    //console.log('enter')
                    ctx.fillStyle = drawing.selectedColor;
                    ctx.beginPath();
                    ctx.arc(e.offsetX, e.offsetY, drawing.brushSize / 2, 10, 2, 2 * Math.PI);
                    ctx.fill();
                    ctx.closePath();
                    lastX = e.offsetX;
                    lastY = e.offsetY;
                }
                initPlaybackSlider()

            }

            function historySaver() {

                let chosenFrame = parseInt(document.getElementById("frameSelector").value)

                if (!drawing.history[chosenFrame - 1]) {
                    drawing.history[chosenFrame - 1] = {
                        histData: [],
                        entryPoint: undefined
                    }
                }

                let thisFrameHistory = drawing.history[chosenFrame - 1]

                if (thisFrameHistory.histData.length < 10) {
                    let dataURL = canvas.toDataURL();
                    thisFrameHistory.histData.push(dataURL)
                    thisFrameHistory.entryPoint = thisFrameHistory.histData.length - 1
                }
                else {
                    drawing.history[chosenFrame - 1].histData.shift()
                }
            }

            function pointerUp(e) {
                if ((e.target.id == "image" || e.target.id == "canvas") && !multipleTouches && !moveToolEnabled) {
                    pointerIsUp = true;
                    lastX = undefined;
                    lastY = undefined;
                    chosenFrame = parseInt(document.getElementById("frameSelector").value)
                    let dataURL = canvas.toDataURL();
                    drawing.frames[chosenFrame - 1] = dataURL;
                    historySaver()
                    checkDrawingSize()
                }

            }

            function handleCopyAndPaste() {

                let copyFrame = document.getElementById("copyFrame");
                let pasteFrame = document.getElementById("pasteFrame");
                let drawClipboard = document.getElementById("drawClipboard");
                let removeFrame = document.getElementById("removeFrame");

                pasteFrame.addEventListener('pointerup', (e) => {
                    let selectedFrame = document.getElementsByClassName('clipboardImage-active')[0];
                    if (selectedFrame) {
                        drawing.frames[chosenFrame - 1] = selectedFrame.src;
                        renderImage(drawing.frames[chosenFrame - 1]);
                        checkDrawingSize();
                    }
                })

                removeFrame.addEventListener('pointerup', (e) => {
                    let selectedFrame = document.getElementsByClassName('clipboardImage-active')[0];
                    if (selectedFrame) {
                        drawing.clipboard.splice(selectedFrame.id, 1);
                        selectedFrame.remove();
                    }
                })

                drawClipboard.addEventListener('pointerup', (e) => {
                    if (e && e.target.classList.contains('clipboardImage')) {
                        let allImages = document.getElementsByClassName('clipboardImage');
                        for (let i = 0; i < allImages.length; i++) {
                            allImages[i].classList.remove('clipboardImage-active');
                        }
                        if (!(e.target.classList.contains('clipboardImage-active'))) {
                            e.target.classList.add('clipboardImage-active');
                        }
                    }
                })

                copyFrame.addEventListener('pointerup', (e) => {
                    if (drawing.frames[chosenFrame - 1] && drawing.clipboard.length <= 20) {

                        drawing.clipboard.push(drawing.frames[chosenFrame - 1]);
                        drawClipboard.innerHTML = '';
                        for (let i = 0; i < drawing.clipboard.length; i++) {
                            let image = document.createElement('img');
                            image.classList.add("clipboardImage")
                            image.id = i;
                            image.src = drawing.clipboard[i];
                            drawClipboard.appendChild(image);
                        }
                    }
                })

            }
            handleCopyAndPaste()

            function handleHistory() {

                let undo = document.getElementById("undo");
                let redo = document.getElementById("redo");


                undo.addEventListener('pointerup', (e) => {
                    let chosenFrame = parseInt(document.getElementById("frameSelector").value);
                    let historyData = drawing.history[chosenFrame - 1].histData
                    let currentEntryPoint = drawing.history[chosenFrame - 1].entryPoint

                    if (historyData.length != 0 && currentEntryPoint > 0) {
                        drawing.frames[chosenFrame - 1] = drawing.history[chosenFrame - 1].histData[currentEntryPoint - 1]
                        drawing.history[chosenFrame - 1].entryPoint -= 1
                        renderImage(drawing.frames[chosenFrame - 1])
                    }
                })

                redo.addEventListener('pointerup', (e) => {
                    let chosenFrame = parseInt(document.getElementById("frameSelector").value);
                    let historyData = drawing.history[chosenFrame - 1].histData
                    let currentEntryPoint = drawing.history[chosenFrame - 1].entryPoint
                    if (historyData.length != 0 && currentEntryPoint + 1 < 20 && historyData[currentEntryPoint + 1]) {
                        drawing.frames[chosenFrame - 1] = drawing.history[chosenFrame - 1].histData[currentEntryPoint + 1]
                        drawing.history[chosenFrame - 1].entryPoint += 1
                        renderImage(drawing.frames[chosenFrame - 1])
                    }
                })

            }
            handleHistory()

            function pointerMove(e) {
                if ((e.target.id == "image" || e.target.id == "canvas") && !multipleTouches && !moveToolEnabled) {
                    if (!pointerIsUp) {

                        ctx.beginPath();
                        ctx.strokeStyle = drawing.selectedColor;
                        ctx.lineWidth = drawing.brushSize;
                        ctx.lineJoin = "round";
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(e.offsetX, e.offsetY);
                        ctx.closePath();
                        ctx.stroke();

                        lastX = e.offsetX;
                        lastY = e.offsetY;
                    }
                }
            }

            function prevent(e) {
                if (e.touches.length > 1) {
                    multipleTouches = true
                }
                else if (e.touches.length == 1) {
                    multipleTouches = false
                }
                e.preventDefault();
            }

            function animationHandling() {

                let interval;
                let arrayPos = 0

                function animationStep() {
                    if (arrayPos < drawing.frames.length) {
                        renderImage(drawing.frames[arrayPos]);
                        arrayPos++;
                        frameInput.value = arrayPos;
                    }
                    else {
                        arrayPos = 0;
                        frameInput.value = 0;
                    }
                    initPlaybackSlider()
                }

                function playAnimation() {
                    document.getElementById("image").style.display = "none";
                    interval = setInterval(animationStep, 10000 / drawing.animationFrames)
                }

                function stopAnimation() {

                    let currentFrame = document.getElementById("frameSelector").value;
                    document.getElementById("image").style.display = "block";
                    document.getElementById("hideBackground").checked = false;

                    if (drawing.frames[parseInt(currentFrame) - 1]) {
                        createPreviousFrameImage(drawing.frames[currentFrame - 2])
                    }
                    if (drawing.frames[parseInt(currentFrame)] - 1) {
                        renderImage(drawing.frames[parseInt(currentFrame)] - 1);
                    }
                    clearInterval(interval);
                }

                let animationPlayed = false;
                let animationPlayButton = document.getElementById("animationPlay");

                animationPlayButton.addEventListener('mouseup', (e) => {
                    if (e && !animationPlayed) {
                        animationPlayed = true;
                        playAnimation()
                        animationPlayButton.innerText = "Stop animation"
                        animationPlayButton.classList.add("stop-animation")
                        animationPlayButton.classList.add("play-animation")
                    }
                    else if (e && animationPlayed) {
                        animationPlayed = false;
                        stopAnimation()
                        animationPlayButton.innerText = "Play animation"
                        animationPlayButton.classList.add("play-animation")
                        animationPlayButton.classList.add("stop-animation")
                    }
                })

                let animationPointerDown = false
                let initialValue;

                document.getElementById('animationPlaybackSlider').addEventListener('pointerdown', (e) => {
                    animationPointerDown = true
                })

                document.getElementById('animationPlaybackSlider').addEventListener('pointermove', (e) => {
                    if (animationPointerDown) {
                        if (e.target.value != initialValue) {

                            if (drawing.frames[parseInt(e.target.value) - 2]) {
                                createPreviousFrameImage(drawing.frames[e.target.value - 2])

                            }
                            document.getElementById('frameSelector').value = e.target.value
                            renderImage(drawing.frames[parseInt(e.target.value) - 1]);
                            initialValue = e.target.value
                        }
                    }
                })

                document.getElementById('animationPlaybackSlider').addEventListener('pointerup', (e) => {
                    document.getElementById('frameSelector').value = e.target.value
                    animationPointerDown = false
                })

            }
            animationHandling()

        }
        drawingHandling()
    }

    initCanvas()


    let brushSizeSlider = document.getElementById("slider");

    brushSizeSlider.addEventListener('change', (e) => {
        drawing.brushSize = parseInt(e.target.value);
    })

    canvasContainer.addEventListener('scroll', (e) => {
        if (e) {
            prevFrameImage.style.left = 0;
        }
    })

    secretWord.value = drawing.guessString || '';

    //validations

    const CONSTRAINTS = {
        SECRET_WORD_REGEX: /\w{1,50}/g,
        CONGRATULATION_REGEX: /\w/g,
        MAX_CONGRATULATION_LENGTH: 100,
        MIN_SECRET_WORD_LENGTH: 1,
        MAX_SECRET_WORD_LENGTH: 50,
        MAX_GUESS_COUNT: 15,
        MIN_GUESS_COUNT: 0
    }

    return { drawing, animation }
})()


function isCanvasContainerOverflown() {
    let canvas = document.getElementById("canvasContainer");
    let moveButton = document.getElementById("moveToolContainer")
    if (canvas.scrollHeight > canvas.clientHeight || canvas.scrollWidth > canvas.clientWidth) {
        moveButton.style.display = "block"
    } else {
        moveButton.style.display = "none"
    }
}

window.onload = isCanvasContainerOverflown;
window.onresize = isCanvasContainerOverflown;
window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = "\o/";

    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
});

export default SCRATCHPAD;
