import React, { useState, useRef, useEffect } from 'react';
import { PiChatCircleDotsBold, PiPaperPlaneTiltBold } from 'react-icons/pi';
import { IoArrowBack, IoAttach } from 'react-icons/io5';
import { MdOutlineSupportAgent, MdClose } from 'react-icons/md';
import { PiImageSquareBold, PiMicrophoneBold, PiPlayCircleBold, PiPauseCircleBold } from 'react-icons/pi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { io } from 'socket.io-client';
import { BASE_URL } from '../../Services/baseUrl';
import { getChatHistoryUserApi, uploadChatFileUserApi } from '../../Services/userApi';

const ChatWindow = () => {
    const navigate = useNavigate();
    const { user, accessToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [socket, setSocket] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimeRef = useRef(0);
    const typingTimeoutRef = useRef(null);

    const formatPlaybackTime = (time) => {
        if (!time) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Socket Initialization and History
    useEffect(() => {
        if (!accessToken) return;

        const connectSocket = () => {
            const newSocket = io(BASE_URL, {
                auth: { token: accessToken }
            });

            newSocket.on('connect', () => console.log('Connected to Chat server'));
            
            newSocket.on('receive_message', (msg) => {
                setMessages(prev => [...prev, msg]);
                setIsTyping(false); // Stop typing indicator if new msg arrives
            });

            newSocket.on('user_typing', () => {
                setIsTyping(true);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            });

            setSocket(newSocket);
            return newSocket;
        };

        const loadHistory = async () => {
            try {
                // Fetch history with 'admin'
                const res = await getChatHistoryUserApi(1); // Usually generic
                if (res.status === 200 && res.data?.data) {
                    setMessages(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };

        const currentSocket = connectSocket();
        loadHistory();

        return () => {
            currentSocket.disconnect();
            clearTimeout(typingTimeoutRef.current);
        };
    }, [accessToken]);

    // Timer logic for fake recording
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;
                    recordingTimeRef.current = next;
                    return next;
                });
            }, 1000);
        } else {
            setRecordingTime(0);
            recordingTimeRef.current = 0;
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        
        // Emit typing
        if (socket) {
            socket.emit('typing', { receiverId: 1 }); // Fixed ID for admin for now
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setInput('');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                               ? 'audio/webm;codecs=opus' 
                               : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm');
            
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                    setIsRecording(false);
                    setRecordingTime(0);
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
                const audioFile = new File([audioBlob], `voice_message.${extension}`, { type: mimeType });

                setIsSending(true);
                try {
                    const formData = new FormData();
                    formData.append('file', audioFile);
                    
                    const res = await uploadChatFileUserApi(formData, { "Authorization": `Bearer ${accessToken}` });
                    if (res.status === 200 && res.data?.data) {
                        socket.emit('send_message', {
                            receiverId: 1,
                            content: formatTime(recordingTimeRef.current),
                            messageType: 'voice',
                            fileUrl: res.data.data.fileUrl
                        });
                    }
                } catch (err) {
                    console.error("Failed to send voice message:", err);
                } finally {
                    setIsSending(false);
                    setIsRecording(false);
                    setRecordingTime(0);
                }
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setSelectedFile(null);
            setRecordingTime(0);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            audioChunksRef.current = []; // Clear chunks so it doesn't send on stop
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const toggleVoiceRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if ((!trimmed && !selectedFile && !isRecording) || isSending) return;
        if (!socket) return;

        setIsSending(true);

        try {
            let fileUrl = null;
            let type = 'text';
            let content = trimmed;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const res = await uploadChatFileUserApi(formData, { "Authorization": `Bearer ${accessToken}` });
                if (res.status === 200 && res.data?.data) {
                    fileUrl = res.data.data.fileUrl;
                    type = selectedFile.type.includes('image') ? 'image' : 'pdf';
                    content = selectedFile.name;
                } else {
                    throw new Error("File upload failed");
                }
            } else if (isRecording) {
                // This branch is now handled by mediaRecorder.onstop
                return;
            }

            socket.emit('send_message', {
                receiverId: 1, // the admin's ID
                content,
                messageType: type,
                fileUrl
            });

        } catch (err) {
            console.error(err);
            alert("Failed to send message/file");
        } finally {
            setIsSending(false);
            setInput('');
            setSelectedFile(null);
            setIsRecording(false);
            setRecordingTime(0);

            // Return focus
            if (!isRecording && !selectedFile) {
                setTimeout(() => inputRef.current?.focus(), 10);
            }
        }
    };

    const handleButtonClick = () => {
        if (input.trim() || selectedFile) {
            handleSend();
        } else {
            toggleVoiceRecording();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderMessageContent = (msg) => {
        if (msg.messageType === 'image') {
            return (
                <div className="flex flex-col gap-1">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
                        {msg.fileUrl ? (
                            <img src={msg.fileUrl} alt="attachment" className="w-full h-full object-cover" />
                        ) : (
                            <PiImageSquareBold className="w-8 h-8 text-gray-400" />
                        )}
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/70">
                                View Full
                            </span>
                        </a>
                    </div>
                    {msg.content && <p className="text-[10px] text-gray-400 mt-1 truncate max-w-48">{msg.content}</p>}
                </div>
            );
        }

        if (msg.messageType === 'pdf') {
            return (
                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px] hover:border-black/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                        <IoDocumentTextOutline className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{msg.content || 'Document.pdf'}</p>
                        <p className="text-[10px] text-gray-500 text-left cursor-pointer hover:underline mt-0.5">Click to view</p>
                    </div>
                </a>
            );
        }

        if (msg.messageType === 'voice') {
            const isPlaying = playingVoiceId === msg.id;
            const isAdmin = msg.senderRole === 'admin';
            return (
                <div className={`flex items-center gap-3 min-w-[220px] p-2 rounded-xl transition-all ${
                    isAdmin 
                        ? 'bg-black/5 backdrop-blur-sm border border-black/5' 
                        : 'bg-white/10 backdrop-blur-md border border-white/10'
                }`}>
                    <button 
                        onClick={() => {
                            if (isPlaying) {
                                setPlayingVoiceId(null);
                                setPlaybackProgress(0);
                                setCurrentTime(0);
                            } else {
                                setPlayingVoiceId(msg.id);
                                setPlaybackProgress(0);
                                setCurrentTime(0);
                            }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-sm ${
                            isAdmin 
                                ? 'bg-black text-white' 
                                : 'bg-white text-black'
                        }`}
                    >
                        {isPlaying ? <PiPauseCircleBold className="w-6 h-6" /> : <PiPlayCircleBold className="w-6 h-6" />}
                    </button>
                    {isPlaying && msg.fileUrl && (
                        <audio 
                            autoPlay 
                            src={msg.fileUrl} 
                            onEnded={() => {
                                setPlayingVoiceId(null);
                                setPlaybackProgress(0);
                                setCurrentTime(0);
                            }} 
                            onTimeUpdate={(e) => {
                                const prog = (e.target.currentTime / e.target.duration) * 100;
                                setPlaybackProgress(prog || 0);
                                setCurrentTime(e.target.currentTime);
                            }}
                            className="hidden" 
                        />
                    )}
                    <div className="flex-1 flex flex-col gap-1.5 pt-1">
                        <div className="flex items-end gap-[2px] h-4 relative">
                            {/* Progress Track Background */}
                            <div className="absolute inset-0 flex items-end gap-[2px] opacity-20">
                                {[...Array(20)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-[3px] rounded-full ${isAdmin ? 'bg-black' : 'bg-white'}`}
                                        style={{ height: `${30 + (Math.sin(i * 0.8) * 30 + 30)}%` }}
                                    />
                                ))}
                            </div>
                            {/* Active Progress Wave */}
                            <div 
                                className="absolute inset-0 flex items-end gap-[2px] overflow-hidden transition-all duration-100"
                                style={{ width: `${isPlaying ? playbackProgress : 0}%` }}
                            >
                                {[...Array(20)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-[3px] rounded-full shrink-0 ${isAdmin ? 'bg-black' : 'bg-white'}`}
                                        style={{ height: `${30 + (Math.sin(i * 0.8) * 30 + 30)}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin ? 'text-black/50' : 'text-white/60'
                        }`}>
                            {/* <span className="flex items-center gap-1">
                                <span className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : (isAdmin ? 'bg-black/20' : 'bg-white/20')}`} />
                                {isPlaying ? 'Playing' : 'Voice Note'}
                            </span> */}
                            <span>{isPlaying ? formatPlaybackTime(currentTime) : (msg.content || '0:00')}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return msg.content;
    };

    return (
        <div className="h-screen bg-[#f0f2f5] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-4 py-3 flex items-center gap-3 shadow-md z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                    <IoArrowBack className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-black border-2 border-gray-700 flex items-center justify-center">
                    <MdOutlineSupportAgent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">Yashfi Foundation</p>
                    <p className="text-[11px] text-gray-400 font-medium">Support Team</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {/* ── Static Introduction Message ── */}
                <div className="flex items-end gap-2 self-start max-w-[90%] lg:max-w-[50%]">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                        <MdOutlineSupportAgent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm text-sm leading-relaxed">
                            Welcome to Yashfi Foundation. Together, we can build a world where every gesture of kindness creates a ripple of hope. How can we assist you today?
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1 font-medium italic">Support Team</p>
                    </div>
                </div>

                {messages.map((msg) =>
                    msg.senderRole === 'admin' ? (
                        /* ── Received (LEFT) ── */
                        <div key={msg._id || msg.id} className="flex items-end gap-2 self-start max-w-[80%] lg:max-w-[40%]">
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                                <MdOutlineSupportAgent className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className={`rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                                    ['image', 'pdf'].includes(msg.messageType) 
                                        ? 'bg-transparent shadow-none p-0' 
                                        : 'bg-white text-gray-800'
                                }`}>
                                    {renderMessageContent(msg)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* ── Sent (RIGHT) ── */
                        <div key={msg._id || msg.id} className="flex items-end gap-2 self-end max-w-[80%] lg:max-w-[40%] flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt="You" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-gray-600">
                                        {user?.fullname?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className={`rounded-2xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed ${
                                    ['image', 'pdf'].includes(msg.messageType)
                                        ? 'bg-transparent shadow-none p-0'
                                        : msg.messageType === 'voice' ? 'bg-black shadow-lg border-white/5' : 'bg-black text-white'
                                }`}>
                                    {renderMessageContent(msg)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 text-right mr-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-end gap-2 self-start">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                            <PiChatCircleDotsBold className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                {/* Selected File Preview */}
                {selectedFile && (
                    <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                                selectedFile.type.includes('image') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
                            }`}>
                                {selectedFile.type.includes('image') ? <PiImageSquareBold className="w-5 h-5" /> : <IoDocumentTextOutline className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedFile(null)}
                            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0 text-gray-500 transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="max-w-2xl mx-auto flex items-end gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*,.pdf"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRecording || isSending}
                        className="w-11 h-11 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                    >
                        <IoAttach className="w-6 h-6" />
                    </button>
                    
                    <div className={`flex-1 bg-gray-50 border rounded-2xl flex items-center transition-all ${
                        isRecording 
                            ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] px-4 py-3' 
                            : 'border-gray-200 focus-within:border-black/30 focus-within:ring-2 focus-within:ring-black/5 px-4 py-3 gap-2'
                    }`}>
                        {isRecording ? (
                            <div className="flex items-center justify-between w-full h-[22px] animate-in slide-in-from-right-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-sm font-semibold text-red-500">Recording Audio...</span>
                                </div>
                                <span className="text-sm font-mono text-gray-600">{formatTime(recordingTime)}</span>
                                <button 
                                    onClick={cancelRecording}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 ml-4 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                disabled={!!selectedFile || isSending}
                                placeholder={selectedFile ? `File attached...` : `Message Yashfi Foundation...`}
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-gray-800 resize-none outline-none leading-relaxed placeholder-gray-400 max-h-[120px] disabled:opacity-50"
                            />
                        )}
                    </div>
                    
                    <button
                        onClick={handleButtonClick}
                        disabled={isSending && !isRecording}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md ${
                            isRecording || isSending
                                ? 'bg-red-500 text-white animate-pulse'
                                : (input.trim() || selectedFile)
                                    ? 'bg-black text-white hover:scale-105'
                                    : 'bg-black text-white hover:scale-105'
                        }`}
                    >
                        {isRecording ? (
                            <PiPaperPlaneTiltBold className="w-5 h-5 translate-x-px" />
                        ) : (input.trim() || selectedFile) ? (
                            <PiPaperPlaneTiltBold className="w-5 h-5 -translate-x-px translate-y-px" />
                        ) : (
                            <PiMicrophoneBold className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <style>{`
                    @keyframes voiceWave {
                        0%, 100% { transform: scaleY(1); }
                        50% { transform: scaleY(1.5); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ChatWindow;
