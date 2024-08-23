import React, { useRef, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../contextApi/AuthContext';

const Whiteboard = ({ roomId, setClearCanvas, clearcanvas }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');

    const { socket, user, asyncGetRoomData, asyncStrokeUpload } = useContext(AuthContext);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.lineWidth = 5;
        contextRef.current = context;
    }, []);

    useEffect(() => {
        const getStrokeData = async () => {
            const room = await asyncGetRoomData();
            setStrokes(room.strokes);
        }
        if (!roomId && user) {
            if (user.roomId != "") getStrokeData();
        }
    }, [user])

    useEffect(() => {
        if (clearcanvas) {
            clearCanvas();
            setClearCanvas(false);
        }
    }, [clearcanvas])



    useEffect(() => {
        if (tool === 'eraser') {
            contextRef.current.strokeStyle = '#FFFFFF';
        } else {
            contextRef.current.strokeStyle = color;
        }
    }, [color, tool]);

    useEffect(() => {
        socket.on("receave-stroke", (newStroke) => {
            setStrokes((prev) => [...prev, newStroke]);
            setCurrentStroke([]);
            setRedoStack([]);
            drawCanvas(newStroke);
            console.log(newStroke)
        })

        socket.on("receave-undo", () => {
            setStrokes((prevStrokes) => {
                if (prevStrokes.length === 0) return prevStrokes;
                const lastStroke = prevStrokes[prevStrokes.length - 1];
                setRedoStack((prevRedoStack) => {
                    if (prevRedoStack.length > 0 && prevRedoStack[prevRedoStack.length - 1].id === lastStroke.id) {
                        return prevRedoStack;
                    }
                    return [...prevRedoStack, lastStroke];
                });

                return prevStrokes.slice(0, -1);
            });
        })

        socket.on("receave-redo", () => {
            setRedoStack((prevRedoStack) => {
                if (prevRedoStack.length === 0) return prevRedoStack;
                const lastRedoStroke = prevRedoStack[prevRedoStack.length - 1];
                setStrokes((prevStrokes) => [...prevStrokes, lastRedoStroke]);
                return prevRedoStack.slice(0, -1);;
            });
        })

        socket.on("receave-clear-canvas", () => {
            clearCanvas();
        })

        const clearCanvas = () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            setStrokes([]);
            setRedoStack([]);
        }

        socket.on("room-closed", () => {
            clearCanvas();
        })

        return () => {
            socket.off("receave-stroke");
            socket.off("receave-undo");
            socket.off("receave-redo");
            socket.off("receave-clear-canvas");
            socket.off("room-closed");
        }
    }, [])

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setCurrentStroke([{ x: offsetX, y: offsetY }]);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        setCurrentStroke((prev) => [...prev, { x: offsetX, y: offsetY }]);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;

        contextRef.current.closePath();
        setIsDrawing(false);

        if (currentStroke.length > 1) {
            const stroke = {
                id: uuidv4(),
                tool,
                color: tool === 'eraser' ? '#FFFFFF' : color,
                points: currentStroke,
            };
            setStrokes((prev) => [...prev, stroke]);
            setCurrentStroke([]);
            setRedoStack([]);
            if (roomId) socket.emit("send-stroke", { roomId: roomId, stroke: stroke });
            asyncStrokeUpload(stroke)
        }
    };

    const handleUndo = () => {
        if (strokes.length === 0) return;
        const lastStroke = strokes[strokes.length - 1];
        setRedoStack((prev) => [...prev, lastStroke]);
        setStrokes((prev) => prev.slice(0, -1));
        if (roomId) socket.emit('send-undo', roomId);

    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const lastRedoStroke = redoStack[redoStack.length - 1];
        setStrokes((prev) => [...prev, lastRedoStroke]);
        setRedoStack((prev) => prev.slice(0, -1));
        if (roomId) socket.emit('send-redo', roomId);

    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        setStrokes([]);
        setRedoStack([]);
        if (roomId) socket.emit('send-clear-canvas', roomId);
    };

    const drawCanvas = (newStroke) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.strokeStyle = newStroke.color;
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(newStroke.points[0].x, newStroke.points[0].y);
        newStroke.points.forEach((point, index) => {
            if (index !== 0) {
                context.lineTo(point.x, point.y);
                context.stroke();
            }
        });
        context.closePath();
    }

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        strokes.forEach((stroke) => {
            context.strokeStyle = stroke.color;
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(stroke.points[0].x, stroke.points[0].y);

            stroke.points.forEach((point, index) => {
                if (index !== 0) {
                    context.lineTo(point.x, point.y);
                    context.stroke();
                }
            });
            context.closePath();
        });
    };

    useEffect(() => {
        redrawCanvas();
    }, [strokes]);

    return (
        <div className='relative overflow-hidden w-full h-[100vh]'>
            <div className="flex flex-col items-center  bg-gray-100">
                <h1 className='p-5 text-3xl'>Online Colaborative White Board</h1>
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setTool('pencil')}
                        className={`px-4 py-2 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        Pencil
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`px-4 py-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        Eraser
                    </button>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        disabled={tool === 'eraser'}
                        className="h-10 w-10 cursor-pointer"
                    />
                    <button
                        onClick={handleUndo}
                        className="px-4 py-2 bg-yellow-500 text-white rounded"
                    >
                        Undo
                    </button>
                    <button
                        onClick={handleRedo}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Redo
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Clear Board
                    </button>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="bg-white cursor-crosshair"
            />
        </div>
    );
};

export default Whiteboard;
