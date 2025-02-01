import { useRef, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../contextApi/AuthContext';
import { IoChevronBackOutline } from 'react-icons/io5';
import { FaEraser, FaPencilAlt, FaRedo, FaTrash, FaUndo, FaUserCircle } from 'react-icons/fa';
import RoomUsers from './RoomUsers';
import JoinOrCreateRoom from './JoinOrCreateRoom';
import UserProfile from './UserProfile';

const Whiteboard = ({ roomId, setClearCanvas, setRoomId, isInARoom, setIsInARoom, clearcanvas }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [profile, setProfile] = useState(false)

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

    // const singOutHandler = async () => {
    //     const res = window.confirm("Do you want to signOut!");
    //     if (!res) return;
    //     const result = await asyncSignOut();
    //     // if (result) navigate("/");
    // }

    return (
        <div className="relative overflow-hidden w-full h-screen bg-gray-100">
            <h1 className="absolute top-4 left-[50%] text-3xl font-bold text-gray-800">Online Collaborative Whiteboard</h1>

            {/* Floating Side Panel (now on the right) */}
            <div
                className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${isPanelOpen ? "right-4" : "-right-16"
                    }`}
            >
                <div className="bg-slate-300 rounded-lg shadow-lg p-4 space-y-4">
                    <button
                        onClick={() => setTool("pencil")}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${tool === "pencil" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                        title="Pencil"
                    >
                        <FaPencilAlt />
                    </button>
                    <button
                        onClick={() => setTool("eraser")}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                        title="Eraser"
                    >
                        <FaEraser />
                    </button>
                    <div className="flex items-center justify-center">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={tool === "eraser"}
                            className="h-10 w-10 cursor-pointer rounded-full"
                            title="Color Picker"
                        />
                    </div>
                    <button
                        onClick={handleUndo}
                        className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                        title="Undo"
                    >
                        <FaUndo />
                    </button>
                    <button
                        onClick={handleRedo}
                        className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600"
                        title="Redo"
                    >
                        <FaRedo />
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Clear Board"
                    >
                        <FaTrash />
                    </button>
                </div>

                {/* Toggle Panel Button */}
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-slate-300 rounded-l-lg shadow-lg p-2"
                >
                    <IoChevronBackOutline
                        className={`text-2xl text-gray-700 transition-transform duration-300 ${isPanelOpen ? "rotate-180" : ""}`}
                    />
                </button>
            </div>
            {/* Floating Side Panel (now on the right) */}
            <div
                className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${isLeftPanelOpen ? "left-4" : "-left-72"
                    }`}
            >
                <div className='p-2 bg-slate-300 rounded-xl'>
                    <div className="col" onClick={()=>setProfile(true)}>
                        <div className="flex items-center space-x-3 cursor-pointer group pl-5">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition-all duration-300">
                                {user?.Ava ? (
                                    <img
                                        src={"/placeholder.jpg"}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUserCircle className="w-full h-full text-gray-400" />
                                )}
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-blue-500 transition-colors duration-300">
                                {user && user?.name}
                            </span>
                        </div>
                    </div>
                    {isInARoom ? <RoomUsers roomId={roomId} setRoomId={setRoomId} setIsInARoom={setIsInARoom} setClearCanvas={setClearCanvas} /> :
                        <JoinOrCreateRoom roomId={roomId} setRoomId={setRoomId} setIsInARoom={setIsInARoom} />
                    }
                </div>

                {/* Toggle Panel Button */}
                <button
                    onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                    className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-slate-300 rounded-r-lg shadow-lg p-2"
                >
                    <IoChevronBackOutline
                        className={`text-2xl text-gray-700 transition-transform duration-300 ${isLeftPanelOpen ? "" : "rotate-180"}`}
                    />
                </button>
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="bg-white cursor-crosshair w-full h-full"
            />
            {profile && <UserProfile setProfile={setProfile} />}
        </div>
    );
};

export default Whiteboard;
