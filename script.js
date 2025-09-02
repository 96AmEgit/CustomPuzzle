document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const puzzleContainer = document.getElementById('puzzle-container');
    const originalImageEl = document.getElementById('original-image');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    
    let originalImage = null;
    let puzzlePieces = [];
    let firstSelectedPiece = null;
    const gridSize = 4;

    imageUpload.addEventListener('change', (e) => {
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
    });

    resetButton.addEventListener('click', () => {
        if (originalImage) {
            createPuzzle(originalImage);
        }
    });

    function createPuzzle(image) {
        puzzleContainer.innerHTML = '';
        messageEl.textContent = '';
        puzzlePieces = [];
        firstSelectedPiece = null;
        
        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        const gameContainer = document.getElementById('game-container');
        const containerWidth = gameContainer.clientWidth * 0.4;
        const containerHeight = gameContainer.clientHeight;

        let puzzleWidth, puzzleHeight;

        if (imageWidth > imageHeight) {
            puzzleWidth = Math.min(imageWidth, containerWidth);
            puzzleHeight = (imageHeight / imageWidth) * puzzleWidth;
        } else {
            puzzleHeight = Math.min(imageHeight, containerHeight);
            puzzleWidth = (imageWidth / imageHeight) * puzzleHeight;
        }

        puzzleContainer.style.width = `${puzzleWidth}px`;
        puzzleContainer.style.height = `${puzzleHeight}px`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        const pieceSizeX = puzzleWidth / gridSize;
        const pieceSizeY = puzzleHeight / gridSize;
        
        const totalPieces = gridSize * gridSize;
        
        // 元の位置情報とシャッフルされた位置情報を保持する配列を作成
        const initialPositions = [];
        const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i);
        shuffleArray(shuffledPositions);

        for (let i = 0; i < totalPieces; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.initialIndex = i; // 元々のピースのインデックス
            
            // 背景画像の位置を計算し、スタイルを設定
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
                    
                    // 背景画像の位置を入れ替える
                    const firstPosition = firstSelectedPiece.style.backgroundPosition;
                    const secondPosition = secondSelectedPiece.style.backgroundPosition;

                    firstSelectedPiece.style.backgroundPosition = secondPosition;
                    secondSelectedPiece.style.backgroundPosition = firstPosition;
                    
                    // 選択状態をリセット
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
            return initialIndex == piecePosition;
        });

        if (isSolved) {
            messageEl.textContent = '🎉 パズル完成！おめでとうございます！ 🎉';
        }
    }
    
    // 背景画像の位置からピースのインデックスを計算するヘルパー関数
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
