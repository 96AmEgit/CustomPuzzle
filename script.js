document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const puzzleContainer = document.getElementById('puzzle-container');
    const originalImageEl = document.getElementById('original-image');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    const gridSizeSelect = document.getElementById('grid-size-select');
    const assistCheckbox = document.getElementById('assist-checkbox');
    const socialShareContainer = document.getElementById('social-share-container');
    const shareTwitterButton = document.getElementById('share-twitter');
    const currentTimeEl = document.getElementById('current-time');
    const bestTimeEl = document.getElementById('best-time');

    let originalImage = null;
    let puzzlePieces = [];
    let firstSelectedPiece = null;
    let gridSize = parseInt(gridSizeSelect.value);
    
    let animationFrameId;
    let startTime;
    let lastTime = 0;
    let elapsedTime = 0;

    // 初期読み込み時にベストタイムをロード
    loadBestTime();

    imageUpload.addEventListener('change', handleImageUpload);
    resetButton.addEventListener('click', () => {
        if (originalImage) {
            createPuzzle(originalImage);
        }
    });
    gridSizeSelect.addEventListener('change', (e) => {
        gridSize = parseInt(e.target.value);
        if (originalImage) {
            createPuzzle(originalImage);
        }
        // ピース数変更時に新しいベストタイムをロード
        loadBestTime();
    });
    assistCheckbox.addEventListener('change', checkWin);

    shareTwitterButton.addEventListener('click', () => {
        const timeString = formatTime(elapsedTime);
        const text = `好きな画像でパズルゲームをクリアしました！🎉\nピース数: ${gridSize}x${gridSize}\nタイムは${timeString}でした！`;
        const url = encodeURIComponent(window.location.href);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
        window.open(twitterUrl, '_blank');
    });

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                originalImage = new Image();
                originalImage.src = event.target.result;
                originalImage.onload = () => {
                    originalImageEl.src = originalImage.src;
                    createPuzzle(originalImage);
                };
            };
            reader.readAsDataURL(file);
        }
    }

    function createPuzzle(image) {
        puzzleContainer.innerHTML = '';
        messageEl.textContent = '';
        socialShareContainer.style.display = 'none';
        puzzlePieces = [];
        firstSelectedPiece = null;
        
        resetTimer();
        startTimer();

        const maxContainerWidth = document.body.clientWidth * 0.9;
        const maxContainerHeight = window.innerHeight * 0.7;
        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;
        const imageRatio = imageWidth / imageHeight;
        const maxContainerRatio = maxContainerWidth / maxContainerHeight;

        let puzzleWidth, puzzleHeight;

        if (imageRatio > maxContainerRatio) {
            puzzleWidth = maxContainerWidth;
            puzzleHeight = puzzleWidth / imageRatio;
        } else {
            puzzleHeight = maxContainerHeight;
            puzzleWidth = puzzleHeight * imageRatio;
        }
        
        puzzleContainer.style.width = `${puzzleWidth}px`;
        puzzleContainer.style.height = `${puzzleHeight}px`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        const pieceSizeX = puzzleWidth / gridSize;
        const pieceSizeY = puzzleHeight / gridSize;
        const totalPieces = gridSize * gridSize;
        const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i);
        shuffleArray(shuffledPositions);

        for (let i = 0; i < totalPieces; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.initialIndex = i;
            
            const row = Math.floor(shuffledPositions[i] / gridSize);
            const col = shuffledPositions[i] % gridSize;

            piece.style.width = `${pieceSizeX}px`;
            piece.style.height = `${pieceSizeY}px`;
            piece.style.backgroundImage = `url(${image.src})`;
            piece.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;
            piece.style.backgroundPosition = `-${col * pieceSizeX}px -${row * pieceSizeY}px`;
            
            puzzlePieces.push(piece);
            puzzleContainer.appendChild(piece);
        }
        
        addClickListeners();
        checkWin();
    }
    
    function addClickListeners() {
        puzzlePieces.forEach(piece => {
            piece.addEventListener('click', () => {
                if (!firstSelectedPiece) {
                    firstSelectedPiece = piece;
                    firstSelectedPiece.classList.add('selected');
                } else if (firstSelectedPiece === piece) {
                    firstSelectedPiece.classList.remove('selected');
                    firstSelectedPiece = null;
                } else {
                    const secondSelectedPiece = piece;
                    
                    const firstPosition = firstSelectedPiece.style.backgroundPosition;
                    const secondPosition = secondSelectedPiece.style.backgroundPosition;

                    firstSelectedPiece.style.backgroundPosition = secondPosition;
                    secondSelectedPiece.style.backgroundPosition = firstPosition;
                    
                    firstSelectedPiece.classList.remove('selected');
                    firstSelectedPiece = null;
                    
                    checkWin();
                }
            });
        });
    }

    function checkWin() {
        const isSolved = puzzlePieces.every((piece) => {
            const initialIndex = piece.dataset.initialIndex;
            const piecePosition = getBackgroundPositionIndex(piece.style.backgroundPosition, piece.style.width, piece.style.height);

            if (assistCheckbox.checked) {
                if (initialIndex == piecePosition) {
                    piece.classList.add('correct');
                } else {
                    piece.classList.remove('correct');
                }
            } else {
                piece.classList.remove('correct');
            }

            return initialIndex == piecePosition;
        });

        if (isSolved) {
            stopTimer();
            messageEl.textContent = '🎉 パズル完成！おめでとうございます！ 🎉';
            socialShareContainer.style.display = 'block';

            saveBestTime(elapsedTime);
            
            puzzlePieces.forEach((piece, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const puzzleWidth = puzzleContainer.clientWidth;
                const puzzleHeight = puzzleContainer.clientHeight;
                const pieceSizeX = puzzleWidth / gridSize;
                const pieceSizeY = puzzleHeight / gridSize;

                setTimeout(() => {
                    piece.style.backgroundPosition = `-${col * pieceSizeX}px -${row * pieceSizeY}px`;
                }, 100 * index);
            });
        }
    }
    
    function getBackgroundPositionIndex(bgPosition, width, height) {
        const [x, y] = bgPosition.split(' ').map(val => parseInt(val.replace('px', '')));
        const pieceSizeX = parseInt(width.replace('px', ''));
        const pieceSizeY = parseInt(height.replace('px', ''));

        const col = Math.round(Math.abs(x) / pieceSizeX);
        const row = Math.round(Math.abs(y) / pieceSizeY);
        
        return row * gridSize + col;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- requestAnimationFrameを使ったタイマー機能 ---
    function startTimer() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        startTime = performance.now() - elapsedTime;
        function update() {
            elapsedTime = performance.now() - startTime;
            currentTimeEl.textContent = formatTime(elapsedTime);
            animationFrameId = requestAnimationFrame(update);
        }
        animationFrameId = requestAnimationFrame(update);
    }

    function stopTimer() {
        cancelAnimationFrame(animationFrameId);
    }

    function resetTimer() {
        stopTimer();
        elapsedTime = 0;
        currentTimeEl.textContent = "00:00:00";
    }

    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const displayHours = String(hours).padStart(2, '0');
        const displayMinutes = String(minutes % 60).padStart(2, '0');
        const displaySeconds = String(seconds % 60).padStart(2, '0');

        return `${displayHours}:${displayMinutes}:${displaySeconds}`;
    }

    // --- 変更点：ベストタイム保存機能 ---
    function saveBestTime(time) {
        // キーにピース数を追加
        const key = `bestTime_${gridSize}`;
        const bestTime = localStorage.getItem(key);
        if (bestTime === null || time < parseInt(bestTime)) {
            localStorage.setItem(key, time);
            bestTimeEl.textContent = formatTime(time);
        }
    }

    function loadBestTime() {
        // キーにピース数を追加
        const key = `bestTime_${gridSize}`;
        const bestTime = localStorage.getItem(key);
        if (bestTime) {
            bestTimeEl.textContent = formatTime(parseInt(bestTime));
        } else {
            bestTimeEl.textContent = "--:--:--";
        }
    }
});
