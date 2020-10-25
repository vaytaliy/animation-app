
function initRatePost() {

    document.addEventListener('pointerup', async (e) => {
        if (e && (e.target.closest('.likeClick') || e.target.closest('.dislikeClick'))) {
            let action;
            let closestEl;
            let likes;
            if (e && e.target.closest('.likeClick')) {
                action = 'like';
                closestEl = e.target.closest('.likeClick');
            } else if (e && e.target.closest('.dislikeClick')) {
                action = 'dislike';
                closestEl = e.target.closest('.dislikeClick');
            }
            let id = closestEl.dataset.id;
            let data = {
                type: action,
                postId: id
            }
            const response = await fetch('api/rate/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            const json = await response.json();
            if (json.data) {
                likes = closestEl.parentElement.querySelector('.likes');
                likes.innerText = json.data.likes;
                let arrowContainer = e.target.closest('.arrowContainer');
                let arrows = arrowContainer.querySelectorAll('.arrow');
                let dislikeArrow = arrows[0];
                let likeArrow = arrows[1];
                console.log(arrowContainer);
                if (json.data.choice == 'like') {
                    likeArrow.classList.add('pressed');
                    dislikeArrow.classList.remove('pressed');
                } else if (json.data.choice == 'dislike'){
                    likeArrow.classList.remove('pressed');
                    dislikeArrow.classList.add('pressed');
                } else if (json.data.choice == 'none') {
                    likeArrow.classList.remove('pressed');
                    dislikeArrow.classList.remove('pressed');
                }
            } else {
                drawMessage('error', 'You must be logged in to do that');
            }
        }
    })

}

initRatePost()