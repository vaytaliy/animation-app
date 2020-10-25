function imgLoad() {
    document.querySelectorAll('.card-image').forEach(img => {
            img.src = img.dataset.thumbnail;
            img.onerror = () => {
                img.src = '/images/dead_emoji.png';
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.margin = '0 auto';
            };
    })
    return;
}

imgLoad();
