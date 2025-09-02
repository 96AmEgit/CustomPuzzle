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

    let originalImage = null;
    let puzzlePieces = [];
    let firstSelectedPiece = null;
    let gridSize = parseInt(gridSizeSelect.value);

    // イベントリスナーの設定
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
    });
    assistCheckbox.addEventListener('change', checkWin); // アシストのON/OFFで正解判定を再実行

    // Twitter共有機能
    shareTwitterButton.addEventListener('click', () => {
        const text = `好きな画像でパズルゲームをクリアしました！ 🎉\nピース数: ${gridSize}x${gridSize}`;
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
        checkWin(); // 初期状態でアシスト機能を適用
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

            // アシスト機能のオン/オフ
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
            messageEl.textContent = '🎉 パズル完成！おめでとうございます！ 🎉';
            socialShareContainer.style.display = 'block';
            
            // パズルが元の画像に戻る演出
            puzzlePieces.forEach((piece, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const puzzleWidth = puzzleContainer.clientWidth;
                const puzzleHeight = puzzleContainer.clientHeight;
                const pieceSizeX = puzzleWidth / gridSize;
                const pieceSizeY = puzzleHeight / gridSize;

                setTimeout(() => {
                    piece.style.backgroundPosition = `-${col * pieceSizeX}px -${row * pieceSizeY}px`;
                }, 100 * index); // ピースごとに少し遅延させてアニメーション
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
});
