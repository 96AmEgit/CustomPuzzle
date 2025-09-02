document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const puzzleContainer = document.getElementById('puzzle-container');
    const originalImageEl = document.getElementById('original-image');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    
    let originalImage = null;
    let puzzlePieces = [];
    const gridSize = 4; // 4x4のパズル

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

   // ... (前略)

function createPuzzle(image) {
    puzzleContainer.innerHTML = '';
    messageEl.textContent = '';
    puzzlePieces = [];

    // 画像の縦横比に基づいてパズル全体のサイズを決定
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.clientWidth * 0.4; // 画面幅の40%を基準に
    const containerHeight = gameContainer.clientHeight; // 画面高さを基準に

    let puzzleWidth, puzzleHeight;

    if (imageWidth > imageHeight) {
        puzzleWidth = Math.min(imageWidth, containerWidth);
        puzzleHeight = (imageHeight / imageWidth) * puzzleWidth;
    } else {
        puzzleHeight = Math.min(imageHeight, containerHeight);
        puzzleWidth = (imageWidth / imageHeight) * puzzleHeight;
    }

    // パズルコンテナのサイズを動的に設定
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
        piece.dataset.index = i;

        const positionIndex = piecePositions[i];
        const row = Math.floor(positionIndex / gridSize);
        const col = positionIndex % gridSize;

        piece.style.width = `${pieceSizeX}px`;
        piece.style.height = `${pieceSizeY}px`;
        piece.style.backgroundImage = `url(${image.src})`;
        piece.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;
        piece.style.backgroundPosition = `-${col * pieceSizeX}px -${row * pieceSizeY}px`;

        piece.draggable = true;
        puzzlePieces.push(piece);
        puzzleContainer.appendChild(piece);
    }
    addDragAndDropListeners();
}
// ... (後略)
    function addDragAndDropListeners() {
        let draggedItem = null;

        puzzlePieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedItem = e.target;
                setTimeout(() => {
                    draggedItem.classList.add('dragging');
                }, 0);
            });

            piece.addEventListener('dragend', () => {
                setTimeout(() => {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                }, 0);
            });
            
            piece.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            piece.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== e.target) {
                    const droppedItem = e.target;
                    
                    const draggedIndex = puzzlePieces.indexOf(draggedItem);
                    const droppedIndex = puzzlePieces.indexOf(droppedItem);
                    
                    // 入れ替える
                    puzzleContainer.insertBefore(draggedItem, droppedItem);
                    if (draggedIndex < droppedIndex) {
                        puzzleContainer.insertBefore(droppedItem, draggedItem);
                    } else {
                        puzzleContainer.insertBefore(droppedItem, draggedItem.nextSibling);
                    }

                    // puzzlePieces配列も更新
                    [puzzlePieces[draggedIndex], puzzlePieces[droppedIndex]] = [puzzlePieces[droppedIndex], puzzlePieces[draggedIndex]];
                    
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
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

});
