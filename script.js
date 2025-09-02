document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const puzzleContainer = document.getElementById('puzzle-container');
    const originalImageEl = document.getElementById('original-image');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    
    let originalImage = null;
    let puzzlePieces = [];
    let firstSelectedPiece = null; // 最初に選択されたピース
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
        const piecePositions = Array.from({ length: totalPieces }, (_, i) => i);
        shuffleArray(piecePositions);

        for (let i = 0; i < totalPieces; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.index = i; // 正解の位置
            
            const positionIndex = piecePositions[i];
            const row = Math.floor(positionIndex / gridSize);
            const col = positionIndex % gridSize;

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
                    // 1つ目のピースを選択
                    firstSelectedPiece = piece;
                    firstSelectedPiece.classList.add('selected');
                } else if (firstSelectedPiece === piece) {
                    // 選択済みのピースを再度クリックした場合、選択を解除
                    firstSelectedPiece.classList.remove('selected');
                    firstSelectedPiece = null;
                } else {
                    // 2つ目のピースを選択し、入れ替え
                    const secondSelectedPiece = piece;
                    
                    const firstIndex = Array.from(puzzleContainer.children).indexOf(firstSelectedPiece);
                    const secondIndex = Array.from(puzzleContainer.children).indexOf(secondSelectedPiece);
                    
                    // 入れ替える
                    puzzleContainer.insertBefore(secondSelectedPiece, firstSelectedPiece);
                    if (firstIndex < secondIndex) {
                        puzzleContainer.insertBefore(firstSelectedPiece, secondSelectedPiece.nextSibling);
                    } else {
                        puzzleContainer.insertBefore(firstSelectedPiece, secondSelectedPiece);
                    }
                    
                    // puzzlePieces配列も更新
                    [puzzlePieces[firstIndex], puzzlePieces[secondIndex]] = [puzzlePieces[secondIndex], puzzlePieces[firstIndex]];
                    
                    // 選択状態をリセット
                    firstSelectedPiece.classList.remove('selected');
                    firstSelectedPiece = null;
                    
                    checkWin();
                }
            });
        });
    }

    function checkWin() {
        const isSolved = puzzlePieces.every((piece, index) => {
            return piece.dataset.index == index;
        });

        if (isSolved) {
            messageEl.textContent = '🎉 パズル完成！おめでとうございます！ 🎉';
        }
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
