import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaintBrush, FaEraser, FaSave, FaTrash, FaCamera } from 'react-icons/fa';
import './App.css';

function App() {
    const [canvas, setCanvas] = useState(null);
    const [context, setContext] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [photo, setPhoto] = useState(null); 

    useEffect(() => {
        const canvasElement = document.getElementById('drawingCanvas');
        setCanvas(canvasElement);

        if (canvasElement) {
            setContext(canvasElement.getContext('2d'));
        }

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [canvas]);

    const handleResize = () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    };

    const saveDrawing = async () => {
        if (canvas) {
            const dataURL = canvas.toDataURL('image/png');
    
            try {
                await axios.post('http://localhost:5000/save-drawing', { dataURL }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    maxContentLength: Infinity,
                });
            } catch (error) {
                console.error('Error saving drawing:', error);
            }
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-drawings');
            const drawings = response.data;

            context.clearRect(0, 0, canvas.width, canvas.height);

            drawings.forEach((drawing) => {
                const img = new Image();
                img.src = drawing.dataURL;
                img.onload = () => {
                    context.drawImage(img, 0, 0);
                };
            });
        } catch (error) {
            console.error('Error fetching drawings:', error);
        }
    };

    const clearCanvas = () => {
        if (context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const takePhoto = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                const video = document.createElement('video');
                const photoContext = canvas.getContext('2d');

                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();

                    // Capture the photo after a delay 2s
                    setTimeout(() => {
                        photoContext.drawImage(video, 0, 0, canvas.width, canvas.height);
                        setPhoto(canvas.toDataURL('image/png'));
                        video.srcObject.getTracks().forEach((track) => track.stop());
                    }, 2000);
                };
            })
            .catch((error) => {
                console.error('Error accessing camera:', error);
            });
    };

    return (
        <div className="app-container">
                     <div className="toolbar">
                <button onClick={() => setColor('#000000')}>
                    <FaPaintBrush />
                </button>
                <button onClick={() => setColor('#FFFFFF')}>
                    <FaEraser />
                </button>
                <button onClick={saveDrawing}>
                    <FaSave />
                </button>
                <button onClick={clearCanvas}>
                    <FaTrash />
                </button>
                <button onClick={takePhoto}>
                    <FaCamera />
                </button>
                <div className="color-palette">
                    <button style={{ backgroundColor: '#000000' }} onClick={() => setColor('#000000')}></button>
                    <button style={{ backgroundColor: '#FFFFFF' }} onClick={() => setColor('#FFFFFF')}></button>
                    <button style={{ backgroundColor: '#FF0000' }} onClick={() => setColor('#FF0000')}></button>
                    <button style={{ backgroundColor: '#0000FF' }} onClick={() => setColor('#0000FF')}></button>
                    <button style={{ backgroundColor: '#FFFF00' }} onClick={() => setColor('#FFFF00')}></button>
                </div>
            </div>
            <canvas
                id="drawingCanvas"
                onMouseDown={(e) => {
                    if (canvas) {
                        setDrawing(true);
                        context.beginPath();
                        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
                    }
                }}
                onMouseUp={() => setDrawing(false)}
                onMouseMove={(e) => {
                    if (!drawing || !canvas || !context) return;

                    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
                    context.strokeStyle = color;
                    context.lineWidth = 5;
                    context.stroke();
                    context.beginPath();
                    context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
                }}
            ></canvas>
            {photo && (
                <div className="photo-overlay">
                    <img src={photo} alt="Captured Photo" />
                </div>
            )}
        </div>
    );
}

export default App;
