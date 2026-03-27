import React, { useState, useRef, useEffect, useContext } from 'react';
import { IoSend, IoAttach, IoMicOutline, IoMicOffOutline, IoCheckmarkDoneOutline, IoEllipsisVertical, IoClose, IoTrashOutline, IoSearchOutline, IoArrowBack, IoDocumentTextOutline, IoCopyOutline, IoCheckmark, IoCheckmarkDone, IoLink } from 'react-icons/io5';
import { MdOutlineSupportAgent, MdDeleteOutline, MdClose } from 'react-icons/md';
import { PiChatCircleDotsBold, PiPaperPlaneTiltBold, PiMicrophoneBold, PiSpeakerHighBold, PiPlayCircleBold, PiPauseCircleBold, PiImageSquareBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthContext } from '../../Contexts/AuthContext';
import { BASE_URL } from '../../Services/baseUrl';
import Swal from 'sweetalert2';
import { getChatUsersApi, getChatHistoryAdminApi, uploadChatFileAdminApi, markChatAsReadApi, deleteChatMessageAdminApi } from '../../Services/adminApi';
import MediaModal from '../../Components/MediaModal';

const Messages = () => {
    const { adminAccessToken: accessToken, adminStatus: adminData } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [lastSeenData, setLastSeenData] = useState({});
    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [socket, setSocket] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [previewMedia, setPreviewMedia] = useState({ isOpen: false, url: '', type: '', name: '' });
    const [activeActionMenu, setActiveActionMenu] = useState(null); // stores messageId
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimeRef = useRef(0);
    const navigate = useNavigate();

    const formatPlaybackTime = (time) => {
        if (!time) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Fetch initial users list
    useEffect(() => {
        const fetchUsers = async () => {
            if (accessToken) {
                try {
                    const reqHeader = {
                        "Authorization": `Bearer ${accessToken}`
                    };
                    const res = await getChatUsersApi(reqHeader);
                    if (res.status === 200) {
                        const users = res.data.data || [];
                        setConversations(users);
                    }
                } catch (err) {
                    console.error("Failed to fetch chat users:", err);
                }
            }
        };
        fetchUsers();
    }, [accessToken]);

    // Socket Initialization
    useEffect(() => {
        if (!accessToken) return;

        const newSocket = io(BASE_URL, {
            auth: { token: accessToken }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected Admin:', newSocket.id);
            newSocket.emit("get_online_users");
        });

        newSocket.on("online_users_list", (users) => {
            setOnlineUsers(new Set(users.map(u => u.toString())));
        });

        newSocket.on("user_status", ({ userId, status, lastSeen }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                if (status === "online") next.add(userId.toString());
                else next.delete(userId.toString());
                return next;
            });
            if (lastSeen) {
                setLastSeenData(prev => ({ ...prev, [userId.toString()]: lastSeen }));
            }
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        // Handle receiving messages
        newSocket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            
            // Mark as read on backend if it's the active chat
            if (msg.senderRole === 'user' && activeChat && (activeChat._id || activeChat.id) === msg.senderId) {
                markChatAsReadApi(msg.senderId).catch(console.error);
                // Real-time status update via socket
                newSocket.emit('message_delivered', { messageId: msg.id || msg._id });
                newSocket.emit('message_read', { messageId: msg.id || msg._id });
            } else if (msg.senderRole === 'user') {
                // Just delivered if not active
                newSocket.emit('message_delivered', { messageId: msg.id || msg._id });
            }

            // Re-order conversations and update last message
            setConversations(prev => {
                const senderId = msg.senderId;
                const receiverId = msg.receiverId;
                const existingIndex = prev.findIndex(c => (c._id || c.id) === senderId || (c._id || c.id) === receiverId);
                let updatedUsers = [...prev];
                
                if (existingIndex > -1) {
                    const user = { ...updatedUsers[existingIndex] };
                    let text = msg.messageType === 'text' ? msg.content : 
                               msg.messageType === 'voice' ? msg.content : 
                               msg.messageType === 'image' ? 'Image' : 'Document';
                    
                    user.lastMessage = text;
                    user.lastMessageType = msg.messageType;
                    user.lastMessageUrl = msg.fileUrl;
                    user.updatedAt = msg.createdAt;
                    
                    if (msg.senderRole === 'user' && (!activeChat || (activeChat._id || activeChat.id) !== msg.senderId)) {
                        user.unread = (user.unread || 0) + 1;
                    }
                    
                    updatedUsers.splice(existingIndex, 1);
                    updatedUsers.unshift(user);
                } else {
                    // Fetch sorted users again if this is a new person
                    const reqHeader = { "Authorization": `Bearer ${accessToken}` };
                    getChatUsersApi(reqHeader).then(res => {
                        if (res.status === 200) setConversations(res.data.data || []);
                    });
                }
                
                return updatedUsers;
            });
            
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        // Handle status updates for sent messages
        newSocket.on('message_delivered_status', ({ messageId }) => {
            setMessages(prev => prev.map(m => 
                (m.id === messageId || m._id === messageId) ? { ...m, isDelivered: true } : m
            ));
        });

        newSocket.on('message_read_status', ({ messageId, senderId, all }) => {
            setMessages(prev => prev.map(m => {
                if (all) {
                    if (m.senderRole === 'admin' && m.receiverId === senderId) return { ...m, isRead: true, isDelivered: true };
                    return m;
                }
                if (m.id === messageId || m._id === messageId) return { ...m, isRead: true, isDelivered: true };
                return m;
            }));
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [accessToken, activeChat]);

    // Fetch messages when activeChat changes
    useEffect(() => {
        const fetchHistory = async () => {
            if (activeChat && accessToken && socket) {
                try {
                    const reqHeader = { "Authorization": `Bearer ${accessToken}` };
                    const chatId = activeChat._id || activeChat.id;
                    const res = await getChatHistoryAdminApi(chatId, reqHeader);
                    if (res.status === 200) {
                        const history = res.data.data || [];
                        setMessages(history);
                        
                        // Mark history as read
                        socket.emit('message_read', { senderId: chatId });
                        
                        // Sync sidebar with last message from history if needed
                        if (history.length > 0) {
                            const lastMsg = history[history.length - 1];
                            setConversations(prev => {
                                let updated = [...prev];
                                const index = updated.findIndex(c => (c._id || c.id) === chatId);
                                if (index > -1) {
                                    const chat = { ...updated[index] };
                                    let text = lastMsg.messageType === 'voice' ? lastMsg.content : 
                                               (lastMsg.messageType === 'text' ? lastMsg.content : 
                                               (lastMsg.messageType === 'image' ? 'Image' : 'Document'));
                                    
                                    chat.lastMessage = text;
                                    chat.lastMessageType = lastMsg.messageType;
                                    chat.lastMessageUrl = lastMsg.fileUrl;
                                    chat.updatedAt = lastMsg.createdAt;
                                    updated[index] = chat;
                                }
                                return updated;
                            });
                        }
                        
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                } catch (err) {
                    console.error("Failed to fetch history:", err);
                }
            } else {
                setMessages([]);
            }
        };
        fetchHistory();
    }, [activeChat, accessToken]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.action-menu-container') && !e.target.closest('.action-modal')) {
                setActiveActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatChatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0);
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff === 0) return "Today";
        if (diff === oneDay) return "Yesterday";
        if (diff < 7 * oneDay) {
            return d.toLocaleDateString('en-US', { weekday: 'long' });
        }
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleCopyMessage = (content) => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setActiveActionMenu(null);
        Swal.fire({
            title: 'Copied!',
            text: 'Message copied to clipboard.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Message?',
                text: "This will remove the message content for everyone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#000',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const response = await deleteChatMessageAdminApi(messageId);

                if (response?.data?.success) {
                    // Optimized state update: Remove the message from local state
                    setMessages(prev => prev.filter(m => m.id !== messageId && m._id !== messageId));
                }
            }
        } catch (err) {
            console.error("Delete failed:", err);
            Swal.fire('Error', 'Failed to delete message. Please try again.', 'error');
        }
    };

    // Format recording time
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

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

    const handleSend = async () => {
        const trimmed = input.trim();
        if ((!trimmed && !selectedFile && !isRecording) || isSending || !socket || !activeChat) return;
        setIsSending(true);

        const reqHeader = {
            "Authorization": `Bearer ${accessToken}`
        };

        try {
            if (selectedFile) {
                const chatId = activeChat._id || activeChat.id;
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('receiverId', activeChat._id || activeChat.id);
                formData.append('receiverRole', 'user');

                const res = await uploadChatFileAdminApi(formData, reqHeader);
                if (res.status === 200 && res.data?.data) {
                    const fileUrl = res.data.data.fileUrl;
                    const type = selectedFile.type.includes('image') ? 'image' : 'pdf';
                    
                    socket.emit('send_message', {
                        receiverId: chatId,
                        receiverRole: 'user',
                        messageType: type,
                        content: selectedFile.name,
                        fileUrl: fileUrl
                    });
                    
                    // Update local conversations state
                    setConversations(prev => {
                        let updated = [...prev];
                        const index = updated.findIndex(c => (c._id || c.id) === chatId);
                        if (index > -1) {
                            const chat = { ...updated[index] };
                            chat.lastMessage = 'Image';
                            chat.lastMessageType = type;
                            chat.lastMessageUrl = fileUrl; // For thumbnail
                            chat.updatedAt = new Date().toISOString();
                            updated.splice(index, 1);
                            updated.unshift(chat);
                        }
                        return updated;
                    });

                    setSelectedFile(null);
                }
            } else if (trimmed) {
                const chatId = activeChat._id || activeChat.id;
                // Send text message
                    socket.emit('send_message', {
                        receiverId: chatId,
                        receiverRole: 'user',
                        messageType: 'text',
                        content: trimmed
                    });

                    // Update local conversations state for immediate feedback
                    setConversations(prev => {
                        let updated = [...prev];
                        const index = updated.findIndex(c => (c._id || c.id) === chatId);
                        if (index > -1) {
                            const chat = { ...updated[index] };
                            chat.lastMessage = trimmed;
                            chat.lastMessageType = 'text';
                            chat.lastMessageUrl = null;
                            chat.updatedAt = new Date().toISOString();
                            updated.splice(index, 1);
                            updated.unshift(chat);
                        }
                        return updated;
                    });
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setIsSending(false);
            setInput('');
            
            if (!isRecording && !selectedFile) {
                setTimeout(() => inputRef.current?.focus(), 10);
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setInput('');
        }
    };

    const handleLinkPrompt = async () => {
        if (!activeChat) return;
        const { value: url } = await Swal.fire({
            title: 'Share a link',
            input: 'url',
            inputLabel: 'Enter the URL',
            inputPlaceholder: 'https://example.com',
            showCancelButton: true,
            confirmButtonColor: '#000',
            inputValidator: (value) => {
                if (!value) return 'You need to enter a URL!';
                try { new URL(value); } catch (_) { return 'Invalid URL format!'; }
            }
        });

        if (url && socket) {
            socket.emit('send_message', {
                receiverId: activeChat._id || activeChat.id,
                receiverRole: 'user',
                content: url,
                messageType: 'link'
            });
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
                
                if (socket && activeChat) {
                    try {
                        setIsSending(true);
                        const chatId = activeChat._id || activeChat.id;
                        const formData = new FormData();
                        formData.append('file', audioFile);
                        formData.append('receiverId', chatId);
                        formData.append('receiverRole', 'user');
                        
                        const reqHeader = { "Authorization": `Bearer ${accessToken}` };
                        const res = await uploadChatFileAdminApi(formData, reqHeader);
                        if (res.status === 200 && res.data?.data) {
                            // Message is sent
                            socket.emit('send_message', {
                                receiverId: chatId,
                                receiverRole: 'user',
                                messageType: 'voice',
                                content: formatTime(recordingTimeRef.current),
                                fileUrl: res.data.data.fileUrl
                            });

                            // Update local conversations state
                            const voiceDuration = formatTime(recordingTimeRef.current);
                            setConversations(prev => {
                                let updated = [...prev];
                                const index = updated.findIndex(c => (c._id || c.id) === chatId);
                                if (index > -1) {
                                    const chat = { ...updated[index] };
                                    chat.lastMessage = voiceDuration;
                                    chat.lastMessageType = 'voice';
                                    chat.lastMessageUrl = res.data.data.fileUrl;
                                    chat.updatedAt = new Date().toISOString();
                                    updated.splice(index, 1);
                                    updated.unshift(chat);
                                }
                                return updated;
                            });
                        }
                    } catch (err) {
                        console.error("Failed to send voice message:", err);
                    } finally {
                        setIsSending(false);
                        setIsRecording(false);
                        setRecordingTime(0);
                    }
                }
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            console.log("Starting recording with mimeType:", mimeType);
            mediaRecorder.start();
            setIsRecording(true);
            setSelectedFile(null);
            setRecordingTime(0);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            // Optionally add a toast here
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // Clear chunks so it doesn't send
            audioChunksRef.current = [];
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

    const filteredConversations = conversations.filter(c => 
        (c.fullname || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const markAsRead = async (chatId) => {
        try {
            await markChatAsReadApi(chatId);
            setConversations(prev => prev.map(c => 
                (c._id || c.id) === chatId ? { ...c, unread: 0 } : c
            ));
        } catch (err) {
            console.error("Failed to mark messages as read:", err);
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
                        <div 
                            onClick={() => setPreviewMedia({ isOpen: true, url: msg.fileUrl, type: 'image', name: 'Image' })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer"
                        >
                            <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
                                View Full
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.messageType === 'pdf') {
            return (
                <div 
                    onClick={() => setPreviewMedia({ isOpen: true, url: msg.fileUrl, type: 'pdf', name: 'PDF Document' })}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px] hover:border-black/10 transition-colors group text-left cursor-pointer"
                >
                    <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                        <IoDocumentTextOutline className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">PDF Document</p>
                        <p className="text-[10px] text-gray-500 hover:underline">Click to preview</p>
                    </div>
                </div>
            );
        }

        if (msg.messageType === 'voice') {
            const isPlaying = playingVoiceId === msg.id;
            const isAdmin = msg.senderRole !== 'user'; // Supporting senderRole admin/support
            return (
                <div className={`flex items-center gap-3 min-w-[220px] p-2 rounded-xl transition-all ${
                    isAdmin 
                        ? 'bg-white/10 backdrop-blur-md border border-white/10'
                        : 'bg-black/5 backdrop-blur-sm border border-black/5'
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
                                ? 'bg-white text-black'
                                : 'bg-black text-white'
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
                                        className={`w-[3px] rounded-full ${isAdmin ? 'bg-white' : 'bg-black'}`}
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
                                        className={`w-[3px] rounded-full shrink-0 ${isAdmin ? 'bg-white' : 'bg-black'}`}
                                        style={{ height: `${30 + (Math.sin(i * 0.8) * 30 + 30)}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin ? 'text-white/60' : 'text-black/50'
                        }`}>
                            {/* <span className="flex items-center gap-1">
                                <span className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : (isAdmin ? 'bg-white/20' : 'bg-black/20')}`} />
                                {isPlaying ? 'Playing' : 'Voice Note'}
                            </span> */}
                            <span>{isPlaying ? formatPlaybackTime(currentTime) : (msg.content || '0:00')}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.messageType === 'link') {
            const isAdmin = msg.senderRole !== 'user';
            return (
                <a 
                    href={msg.content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-1 py-0.5 hover:opacity-80 transition-opacity no-underline group`}
                >
                    <IoLink className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className={`text-sm underline break-all font-medium ${isAdmin ? 'text-blue-300' : 'text-blue-600'}`}>
                        {msg.content}
                    </span>
                </a>
            );
        }

        return msg.content || msg.text;
    };

    return (
        <div className="bg-white flex h-screen w-full overflow-hidden">
            {/* Left Sidebar - Chat List */}
            <div className={`w-full md:w-80 md:border-r border-gray-100 flex-col shrink-0 bg-white ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Search Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0"
                        >
                            <IoArrowBack className="w-5 h-5 text-gray-700" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    </div>
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    {filteredConversations.map((chat) => (
                        <button
                            key={chat._id || chat.id}
                            onClick={() => {
                                setActiveChat(chat);
                                markAsRead(chat._id || chat.id);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                                (activeChat?._id || activeChat?.id) === (chat._id || chat.id) 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'hover:bg-gray-50 text-gray-900'
                            }`}
                        >
                            <div className="relative shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${
                                    (activeChat?._id || activeChat?.id) === (chat._id || chat.id) ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {chat.profilePic ? (
                                        <img src={chat.profilePic} alt={chat.fullname} className="w-full h-full object-cover" />
                                    ) : (
                                        (chat.fullname || chat.name || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                {onlineUsers.has((chat._id || chat.id)?.toString()) && (
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${
                                        (activeChat?._id || activeChat?.id) === (chat._id || chat.id) ? 'border-black' : 'border-white'
                                    }`}></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`font-semibold text-sm truncate ${
                                        (activeChat?._id || activeChat?.id) === (chat._id || chat.id) ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {chat.fullname || chat.name || chat.email}
                                    </p>
                                    <span className={`text-[10px] whitespace-nowrap ${
                                        (activeChat?._id || activeChat?.id) === (chat._id || chat.id) ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        {chat.time || (chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center gap-2 overflow-hidden w-full">
                                    <div className={`text-xs truncate flex items-center gap-1 min-w-0 ${
                                        (activeChat?._id || activeChat?.id) === (chat._id || chat.id) ? 'text-gray-300' : 'text-gray-500'
                                    } ${chat.unread > 0 && (activeChat?._id || activeChat?.id) !== (chat._id || chat.id) ? 'font-semibold text-black' : ''}`}>
                                        {chat.lastMessageType === 'image' || chat.lastMessage === 'Image' ? (
                                            <div className="flex items-center gap-1.5 py-0.5">
                                                <PiImageSquareBold className="w-4 h-4 shrink-0 text-green-500" />
                                                <span className="truncate text-green-500 font-medium">Image</span>
                                            </div>
                                        ) : chat.lastMessageType === 'voice' || (chat.lastMessage && chat.lastMessage.match(/^\d+:\d{2}$/)) ? (
                                            <div className="flex items-center gap-1.5 py-0.5">
                                                <PiMicrophoneBold className="w-4 h-4 shrink-0 text-blue-500" />
                                                <span className="truncate text-blue-500 font-medium">{chat.lastMessage || 'Voice Note'}</span>
                                            </div>
                                        ) : chat.lastMessageType === 'pdf' || chat.lastMessage === 'Document' ? (
                                            <div className="flex items-center gap-1.5 py-0.5">
                                                <IoDocumentTextOutline className="w-4 h-4 shrink-0 text-red-500" />
                                                <span className="truncate font-medium text-gray-600">Document</span>
                                            </div>
                                        ) : (
                                            <span className="truncate">{chat.lastMessage || 'Open chat to view messages'}</span>
                                        )}
                                    </div>
                                    {chat.unread > 0 && (activeChat?._id || activeChat?.id) !== (chat._id || chat.id) && (
                                        <span className="shrink-0 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No conversations found.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Chat Interface */}
            {activeChat ? (
                <div className={`flex-1 flex flex-col bg-[#f0f2f5] min-w-0 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {/* Chat Header */}
                    <div className="h-[73px] bg-white border-b border-gray-100 flex items-center px-4 md:px-6 justify-between shrink-0 shadow-sm z-10">
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={() => setActiveChat(null)}
                                className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0"
                            >
                                <IoArrowBack className="w-5 h-5 text-gray-700" />
                            </button>
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold overflow-hidden">
                                    {activeChat.profilePic ? (
                                        <img src={activeChat.profilePic} alt={activeChat.fullname} className="w-full h-full object-cover" />
                                    ) : (
                                        (activeChat.fullname || activeChat.name || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight">{activeChat.fullname || activeChat.name}</h3>
                                <p className={`text-xs font-medium ${onlineUsers.has(activeChat?._id?.toString() || activeChat?.id?.toString()) ? 'text-green-500' : 'text-gray-500'}`}>
                                    {onlineUsers.has(activeChat?._id?.toString() || activeChat?.id?.toString()) 
                                        ? 'Online' 
                                        : lastSeenData[activeChat?._id?.toString() || activeChat?.id?.toString()]
                                            ? `Last seen: ${new Date(lastSeenData[activeChat?._id?.toString() || activeChat?.id?.toString()]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'Offline'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-400">{activeChat.email}</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm my-auto">
                                No messages in this conversation yet. Send a message to start!
                            </div>
                        )}
                        {messages.filter(msg => !msg.isDeleted).map((msg, index) => {
                            const msgDate = formatChatDate(msg.createdAt);
                            const prevMsgDate = index > 0 ? formatChatDate(messages[index - 1].createdAt) : null;
                            const showSeparator = msgDate !== prevMsgDate;

                            return (
                                <React.Fragment key={msg.id}>
                                    {showSeparator && (
                                        <div className="flex justify-center my-6 relative">
                                            <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                                            <span className="relative bg-[#f0f2f5] px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                {msgDate}
                                            </span>
                                        </div>
                                    )}

                                    {msg.senderRole === 'user' ? (
                                        /* Left (User) Message */
                                        <div className="flex items-end gap-2 self-start max-w-[70%] group">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white">
                                                {activeChat.profilePic ? (
                                                    <img src={activeChat.profilePic} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-700 text-xs font-bold">{(activeChat.fullname || 'U').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className={`rounded-2xl rounded-bl-none px-4 py-2.5 text-sm leading-relaxed transition-all ${
                                                    ['image', 'pdf'].includes(msg.messageType) 
                                                                ? 'bg-transparent shadow-none p-0' 
                                                                : msg.messageType === 'voice' ? 'bg-white shadow-md border-black/5' : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                                                }`}>
                                                    {renderMessageContent(msg)}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 ml-1 font-medium opacity-70">
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Right (Admin/Support) Message */
                                        <div className="flex items-end gap-2 self-end max-w-[70%] flex-row-reverse group">
                                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm border border-white/10">
                                                <MdOutlineSupportAgent className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className={`rounded-2xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed transition-all relative ${
                                                    ['image', 'pdf', 'voice'].includes(msg.messageType)
                                                            ? msg.messageType === 'voice' 
                                                                ? 'bg-blue-600 text-white shadow-md border-0' 
                                                                : 'bg-transparent shadow-none p-0'
                                                            : 'bg-black text-white hover:bg-gray-900 shadow-lg'
                                                }`}>
                                                    {renderMessageContent(msg)}
                                                    
                                                    {/* Actions Menu Trigger */}
                                                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 action-menu-container">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveActionMenu(msg);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Message actions"
                                                        >
                                                            <IoEllipsisVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 mr-1">
                                                    <p className="text-[10px] text-gray-400 font-medium opacity-70">
                                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {!msg.isDeleted && (
                                                        <span className="flex items-center">
                                                            {msg.isRead ? (
                                                                <IoCheckmarkDone className="w-3.5 h-3.5 text-blue-500" />
                                                            ) : msg.isDelivered ? (
                                                                <IoCheckmarkDone className="w-3.5 h-3.5 text-gray-400" />
                                                            ) : (
                                                                <IoCheckmark className="w-3.5 h-3.5 text-gray-400" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        <div ref={bottomRef} className="h-1" />
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

                        <div className="max-w-4xl mx-auto flex items-end gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                className="hidden" 
                                accept="image/*,.pdf"
                            />
                            <button
                                onClick={handleLinkPrompt}
                                disabled={isRecording || isSending}
                                className="w-11 h-11 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                                title="Share link"
                            >
                                <IoLink className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isRecording}
                                className="w-11 h-11 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                                title="Attach file"
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
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={handleKeyDown}
                                        disabled={!!selectedFile || isSending}
                                        placeholder={selectedFile ? `File attached...` : `Reply to ${activeChat.fullname || activeChat.name}...`}
                                        rows={1}
                                        className="flex-1 bg-transparent text-sm text-gray-800 resize-none outline-none leading-relaxed placeholder-gray-400 max-h-[120px] disabled:opacity-50"
                                    />
                                )}
                            </div>
                            
                            <button
                                onClick={handleButtonClick}
                                className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
                                    isRecording || isSending

                                        ? 'bg-red-500 text-white animate-pulse'
                                        : input.trim() || selectedFile
                                            ? 'bg-black text-white'
                                            : 'bg-black text-white' // Mic button
                                }`}
                            >
                                {isRecording ? (
                                    <PiPaperPlaneTiltBold className="w-5 h-5 translate-x-px" />
                                ) : input.trim() || selectedFile ? (
                                    <PiPaperPlaneTiltBold className="w-5 h-5 -translate-x-px translate-y-px" />
                                ) : (
                                    <PiMicrophoneBold className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/50">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <PiChatCircleDotsBold className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                    <p className="text-gray-500 text-sm max-w-sm text-center">
                        Select a conversation from the left to start viewing and replying to user messages.
                    </p>
                </div>
            )}

            <style>{`
                @keyframes voiceWave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.5); }
                }
            `}</style>            {/* Media Preview Modal */}
            <MediaModal 
                isOpen={previewMedia.isOpen}
                onClose={() => setPreviewMedia({ ...previewMedia, isOpen: false })}
                mediaUrl={previewMedia.url}
                mediaType={previewMedia.type}
                mediaName={previewMedia.name}
            />

            {/* Actions Centered Modal */}
            {activeActionMenu && (
                <div 
                    className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setActiveActionMenu(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-xl w-72 overflow-hidden transform transition-all scale-100 action-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Message Options</h3>
                            <button onClick={() => setActiveActionMenu(null)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 hover:bg-gray-200">
                                <MdClose className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                            <button 
                                onClick={() => handleCopyMessage(activeActionMenu.content)}
                                className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl flex items-center gap-3 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                                    <IoCopyOutline className="w-4 h-4" />
                                </div>
                                Copy text
                            </button>
                            <button 
                                onClick={() => {
                                    handleDeleteMessage(activeActionMenu.id || activeActionMenu._id);
                                    setActiveActionMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                    <IoTrashOutline className="w-4 h-4" />
                                </div>
                                Delete for Everyone
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
