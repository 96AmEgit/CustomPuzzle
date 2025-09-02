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

    // パズルを表示するコンテナの最大サイズを取得
    // 画面の幅と高さを取得して、パズルの最大サイズを動的に決定します。
    const maxContainerWidth = document.body.clientWidth * 0.9; // 画面幅の90%
    const maxContainerHeight = window.innerHeight * 0.7; // 画面高さの70%

    // 画像の縦横比に基づいて、パズルのサイズを計算
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    let puzzleWidth, puzzleHeight;

    // 画像の縦横比を維持しながら、最大サイズに収まるように計算
    const imageRatio = imageWidth / imageHeight;
    const maxContainerRatio = maxContainerWidth / maxContainerHeight;

    if (imageRatio > maxContainerRatio) {
        // 画像が横長の場合、幅を基準にサイズを決定
        puzzleWidth = maxContainerWidth;
        puzzleHeight = puzzleWidth / imageRatio;
    } else {
        // 画像が縦長または正方形の場合、高さを基準にサイズを決定
        puzzleHeight = maxContainerHeight;
        puzzleWidth = puzzleHeight * imageRatio;
    }
    
    // パズルコンテナのサイズを動的に設定
    puzzleContainer.style.width = `${puzzleWidth}px`;
    puzzleContainer.style.height = `${puzzleHeight}px`;
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    const pieceSizeX = puzzleWidth / gridSize;
    const pieceSizeY = puzzleHeight / gridSize;
    
    // ... (以下の部分は変更なし) ...
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

