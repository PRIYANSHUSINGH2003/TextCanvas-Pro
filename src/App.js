// App.js
import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
    const canvasRef = useRef(null);
    const [textArray, setTextArray] = useState([]);
    const [fontSize, setFontSize] = useState(20);
    const [fontColor, setFontColor] = useState('#000000');
    const [fontStyle, setFontStyle] = useState('');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [editingText, setEditingText] = useState('');
    const [editingPosition, setEditingPosition] = useState(null);
    const [selectedTextIndex, setSelectedTextIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    useEffect(() => {
        drawText();
    }, [textArray, fontSize, fontColor, fontStyle, fontFamily]);

    const drawText = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        textArray.forEach((textObj) => {
            ctx.font = `${textObj.fontStyle} ${textObj.fontSize}px ${textObj.fontFamily}`;
            ctx.fillStyle = textObj.color;
            ctx.fillText(textObj.text, textObj.x, textObj.y);
        });
    };

    const handleAddTextClick = () => {
        setEditingText('');
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const startX = rect.width / 2;
        const startY = rect.height / 2;
        setEditingPosition({ x: startX, y: startY });
        setSelectedTextIndex(null); // Clear selection for new text
    };

    const handleTextInputChange = (e) => {
        setEditingText(e.target.value);
    };

    const handleTextInputBlur = () => {
        if (editingText.trim()) {
            if (selectedTextIndex !== null) {
                // Update existing text
                setTextArray(prevArray => prevArray.map((textObj, index) =>
                    index === selectedTextIndex
                        ? { ...textObj, text: editingText }
                        : textObj
                ));
            } else {
                // Add new text
                addText(editingText, editingPosition.x, editingPosition.y);
            }
        }
        setEditingPosition(null);
    };

    const addText = (text, x, y) => {
        setTextArray(prevArray => [...prevArray, { text, x, y, fontSize, color: fontColor, fontStyle, fontFamily }]);
        setUndoStack(prevStack => [...prevStack, textArray]);
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (textArray.length > 0) {
            setRedoStack(prevStack => [...prevStack, textArray]);
            setTextArray([]);
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            setTextArray(redoStack.pop());
            setUndoStack(prevStack => [...prevStack, textArray]);
        }
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = textArray.findIndex(textObj =>
            x >= textObj.x - 50 && x <= textObj.x + 50 &&
            y >= textObj.y - 20 && y <= textObj.y + 20
        );

        if (index !== -1) {
            if (e.detail === 1) { // Single click
                setSelectedTextIndex(index);
                setIsDragging(true);
            } else if (e.detail === 2) { // Double click
                setEditingText(textArray[index].text);
                setEditingPosition({ x: textArray[index].x, y: textArray[index].y });
                setSelectedTextIndex(index);
                setIsDragging(false);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && selectedTextIndex !== null) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setTextArray(prevArray => prevArray.map((textObj, idx) => {
                if (idx === selectedTextIndex) {
                    return {
                        ...textObj,
                        x: x,
                        y: y
                    };
                }
                return textObj;
            }));
            drawText();
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCanvasDoubleClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = textArray.findIndex(textObj =>
            x >= textObj.x - 50 && x <= textObj.x + 50 &&
            y >= textObj.y - 20 && y <= textObj.y + 20
        );

        if (index !== -1) {
            setEditingText(textArray[index].text);
            setEditingPosition({ x: textArray[index].x, y: textArray[index].y });
            setSelectedTextIndex(index);
        }
    };

    const handleMouseEnter = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = textArray.findIndex(textObj =>
            x >= textObj.x - 50 && x <= textObj.x + 50 &&
            y >= textObj.y - 20 && y <= textObj.y + 20
        );

        canvas.style.cursor = index !== -1 ? 'pointer' : 'default';
    };

    return (
        <div className="App">
            <div className="top-controls">
                <button onClick={handleUndo}>⭮<br/>Undo</button>
                <button onClick={handleRedo}>⭯<br/>Redo</button>
            </div>
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={handleMouseEnter}
                    onDoubleClick={handleCanvasDoubleClick}
                />
                {editingPosition && (
                    <div
                        className="text-input-container"
                        style={{
                            left: `${editingPosition.x}px`,
                            top: `${editingPosition.y}px`,
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <input
                            type="text"
                            value={editingText}
                            onChange={handleTextInputChange}
                            onBlur={handleTextInputBlur}
                            autoFocus
                            placeholder="Enter text"
                            style={{
                                fontSize: `${fontSize}px`,
                                color: fontColor,
                                fontStyle: fontStyle,
                                fontFamily: fontFamily,
                                border: '1px solid #ccc',
                                padding: '5px',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="bottom-controls">
                <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                >
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                </select>
                <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    min="10"
                    max="100"
                    placeholder="Font size"
                />
                <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                />
                <button onClick={handleAddTextClick}>Add Text</button>
                <button onClick={() => setFontStyle(fontStyle === 'bold' ? '' : 'bold')}>B</button>
                <button onClick={() => setFontStyle(fontStyle === 'italic' ? '' : 'italic')}>I</button>
                <button onClick={() => setFontStyle(fontStyle === 'underline' ? '' : 'underline')}>U</button>
            </div>
        </div>
    );
}

export default App;
