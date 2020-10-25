
function init() {

    let animationThumbnailContainer = document.getElementById('animationContainer');
    let playedAnimationId = null;
    let interval;
    let playedElement;

    //making requests only when no content is loaded

    animationThumbnailContainer.addEventListener('pointerup', async (e) => {
        if (e.target.classList.contains('card-image')) {
            if (e.target.dataset.frames.length == 0) {
                let loader = e.target.parentElement.querySelector('.loader');
                e.target.style.opacity = 0.4;
                loader.classList.remove('hidden');
                try {
                    let frameData = await fetch('/api/play/' + e.target.dataset.id, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        redirect: 'follow',
                    })
                    let parsed = await frameData.json();
                    loader.classList.add('hidden');
                    e.target.style.opacity = 1;
                    e.target.dataset.frames = JSON.stringify(parsed.data.frames);
                } catch (err) {
                    console.log(err);
                }
            }
            let frames = JSON.parse(e.target.dataset.frames);

            handleAnimation()

            function handleAnimation() {

                if (!playedAnimationId) {
                    playAnimation()
                } else {
                    if (playedAnimationId == e.target.dataset.id) {
                        stopExistingAnimation()
                    } else {
                        stopExistingAnimation()
                        playAnimation()
                    }
                    
                }

                function playAnimation() {

                    playedElement = e.target;
                    playedAnimationId = e.target.dataset.id;
                    let currentPos = 0;

                    function playStep() {
                        if (currentPos < frames.length) {
                            e.target.src = frames[currentPos];
                            currentPos++;
                        } else {
                            currentPos = 0;
                        }
                    }

                    interval = setInterval(playStep, 10000 / parseFloat(e.target.dataset.speed))
                }

                function stopExistingAnimation() {
                    playedElement.src = playedElement.dataset.thumbnail;
                    clearInterval(interval);
                    playedAnimationId = null;
                }
            }


        }
    })
}

init()
