import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircle, X, Send, Minimize2, Smile, Check, CheckCheck, FileText, Image as ImageIcon, Mic, Bot } from 'lucide-react';

import axios from 'axios';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

export default function SupportChatWidget() {
    const { props } = usePage();
    const currentUser = props.auth?.user;
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [adminLastSeen, setAdminLastSeen] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); // { src, alt }
    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recognitionRef = useRef(null);

    // Initialize chat when opened
    useEffect(() => {
        if (isOpen && !chatId) {
            initializeChat();
        }
    }, [isOpen]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Setup Echo listener for real-time messages
    useEffect(() => {
        if (chatId && window.Echo) {
            const channelName = `support-chat.${chatId}`;
            const channel = window.Echo.private(channelName);

            channel.listen('.support.message', (e) => {
                setMessages(prev => [...prev, e]);
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
                playMessageSound();
                scrollToBottom();
            });

            channel.listen('.user-typing', (e) => {
                if (e.user_id !== (currentUser?.id ?? null)) {
                    setOtherUserTyping(e.is_typing);
                    if (e.is_typing) {
                        setTimeout(() => setOtherUserTyping(false), 3000);
                    }
                }
            });

            return () => {
                channel.stopListening('.support.message');
                channel.stopListening('.user-typing');
                if (window.Echo) {
                    window.Echo.leave(channelName);
                }
            };
        }
    }, [chatId, isOpen]);

    // Fallback polling - auto-refresh every 5 seconds
    useEffect(() => {
        if (isOpen && chatId) {
            const interval = setInterval(() => {
                refreshChat();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isOpen, chatId]);

    const initializeChat = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/support-chat');
            if (response.data.success) {
                setChatId(response.data.data.chat.id);
                setMessages(response.data.data.messages);
                setUnreadCount(0);
                setAdminOnline(Math.random() > 0.5);
                setAdminLastSeen(new Date());
            }
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshChat = async () => {
        try {
            const response = await axios.get('/api/support-chat');
            if (response.data.success) {
                setMessages(response.data.data.messages);
            }
        } catch (error) {
            console.error('Failed to refresh chat:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !currentUser?.id) return;

        const tempMessage = {
            id: Date.now(),
            message: newMessage,
            user_id: currentUser?.id,
            sender_name: currentUser?.name,
            is_admin: false,
            created_at: new Date().toISOString(),
            temp: true,
        };

        setMessages(prev => [...prev, tempMessage]);
        const messageText = newMessage;
        setNewMessage('');
        stopTyping();
        setShowEmojiPicker(false);

        try {
            const response = await axios.post('/api/support-chat/message', {
                chat_id: chatId,
                message: messageText,
            });

            if (response.data.success) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempMessage.id ? response.data.data : msg
                    )
                );
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('File type not allowed. Please upload images, PDFs, Word, Excel, text files.');
            return;
        }

        setSelectedFile(file);
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async () => {
        if (!selectedFile || !chatId) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('chat_id', chatId);

        try {
            const response = await axios.post('/api/support-chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.data]);
                clearSelectedFile();
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleTyping = () => {
        if (!isTyping && chatId) {
            setIsTyping(true);
            axios.post('/api/support-chat/typing', {
                chat_id: chatId,
                is_typing: true,
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    };

    const stopTyping = () => {
        if (isTyping && chatId) {
            setIsTyping(false);
            axios.post('/api/support-chat/typing', {
                chat_id: chatId,
                is_typing: false,
            });
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setIsMinimized(false);
            setUnreadCount(0);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        inputRef.current?.focus();
    };

    const playMessageSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGWi77eefTRAMUKfj8LZjHAY4ktf');
        audio.volume = 0.3;
        audio.play().catch(() => { });
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return 'Yesterday ' + format(date, 'h:mm a');
        } else {
            return format(date, 'MMM d, h:mm a');
        }
    };

    const getDateSeparator = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const shouldShowDateSeparator = (index) => {
        if (index === 0) return true;
        const currentDate = new Date(messages[index].created_at).toDateString();
        const previousDate = new Date(messages[index - 1].created_at).toDateString();
        return currentDate !== previousDate;
    };

    const cleanupRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        recordedChunksRef.current = [];
    };

    const startRecording = async () => {
        if (!chatId) {
            alert('Please open the chat before recording.');
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support audio recording.');
            return;
        }

        try {
            setRecordingError(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const preferredMime = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                ? 'audio/ogg;codecs=opus'
                : '';

            const mediaRecorder = new MediaRecorder(stream, preferredMime ? { mimeType: preferredMime } : undefined);
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/ogg' });
                if (blob.size === 0) {
                    cleanupRecording();
                    setIsRecording(false);
                    return;
                }

                const file = new File([blob], `voice - message - ${Date.now()}.ogg`, { type: 'audio/ogg' });
                setSelectedFile(file);
                cleanupRecording();
                setIsRecording(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setRecordingError('Could not start recording. Please check microphone permissions.');
            cleanupRecording();
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            cleanupRecording();
            setIsRecording(false);
        }
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setNewMessage(transcript);
                setIsListening(false);
                setSpeechError(null);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);

                // Provide user-friendly error messages
                if (event.error === 'not-allowed') {
                    setSpeechError('Microphone access denied. Please allow microphone permission in your browser settings and try again.');
                } else if (event.error === 'no-speech') {
                    setSpeechError('No speech detected. Please try again.');
                } else if (event.error === 'network') {
                    setSpeechError('Network error. Please check your connection.');
                } else {
                    setSpeechError(`Voice input error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors when stopping
                }
            }
        };
    }, []);

    // Toggle voice input
    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.\n\nPlease use:\n✓ Chrome\n✓ Edge\n✓ Safari');
            return;
        }

        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
            setIsListening(false);
        } else {
            try {
                setIsListening(true);
                setSpeechError(null);
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                setIsListening(false);

                const errorMsg = 'Could not start voice input.\n\n' +
                    'Please:\n' +
                    '1. Allow microphone permission (click 🔒 icon in address bar)\n' +
                    '2. Reload the page\n' +
                    '3. Try again';
                alert(errorMsg);
            }
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#00a884] to-[#008069] text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-200 z-50 flex items-center justify-center group"
                >
                    <MessageCircle className="w-7 h-7" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 animate-bounce">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-4 right-4 w-[340px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[520px]'}`}>
                    {/* Header */}
                    <div className="bg-[#008069] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                {adminOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Support Team</h3>
                                <p className="text-xs text-white/80">
                                    {adminOnline ? 'Online' : adminLastSeen ? `Last seen ${formatDistanceToNow(adminLastSeen, { addSuffix: true })} ` : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Image Preview Lightbox */}
                            {previewImage && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
                                    <div className="relative max-w-full max-h-full p-3">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewImage(null)}
                                            className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <img
                                            src={previewImage.src}
                                            alt={previewImage.alt || ''}
                                            className="max-h-[420px] max-w-[300px] rounded-lg shadow-lg object-contain bg-black"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Messages Area */}
                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-3"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    backgroundColor: '#efeae2'
                                }}
                            >
                                {loading && messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00a884] border-t-transparent"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <MessageCircle className="w-12 h-12 mb-2 opacity-30" />
                                        <p className="text-sm">Start a conversation</p>
                                        <p className="text-xs">We're here to help!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={msg.id}>
                                            {shouldShowDateSeparator(index) && (
                                                <div className="flex justify-center my-4">
                                                    <div className="bg-white/90 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium shadow-sm">
                                                        {getDateSeparator(msg.created_at)}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`flex ${msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start'} `}>
                                                <div
                                                    className={`relative max-w-[75%] px-4 py-3 rounded-lg shadow-sm ${msg.user_id === currentUser?.id ? 'bg-[#d9fdd3] text-gray-900' : 'bg-white text-gray-900'} ${msg.temp ? 'opacity-60' : 'opacity-100'}`}
                                                    style={{
                                                        borderBottomRightRadius: msg.user_id === currentUser?.id ? '2px' : undefined,
                                                        borderBottomLeftRadius: msg.user_id !== currentUser?.id ? '2px' : undefined,
                                                    }}
                                                >
                                                    <div
                                                        className={`absolute bottom - 0 ${msg.user_id === currentUser?.id ? 'right-0 -mr-2' : 'left-0 -ml-2'} `}
                                                        style={{
                                                            width: 0,
                                                            height: 0,
                                                            borderLeft: msg.user_id === currentUser?.id ? '8px solid transparent' : '8px solid #fff',
                                                            borderRight: msg.user_id !== currentUser?.id ? '8px solid transparent' : '8px solid #d9fdd3',
                                                            borderTop: '8px solid transparent',
                                                            borderBottom: `8px solid ${msg.user_id === currentUser?.id ? '#d9fdd3' : '#fff'} `,
                                                        }}
                                                    ></div>

                                                    {/* Attachments */}
                                                    {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                                        <div className="mb-1 space-y-1">
                                                            {msg.attachments.map(att => {
                                                                const fileUrl = att.file_url || (att.file_path ? `/ storage / ${att.file_path} ` : '');
                                                                const isImage = att.file_type === 'image' || (att.mime_type && att.mime_type.startsWith('image/'));
                                                                const isVideo = att.file_type === 'video' || (att.mime_type && att.mime_type.startsWith('video/'));
                                                                const isAudio = att.file_type === 'audio' || (att.mime_type && att.mime_type.startsWith('audio/'));

                                                                return (
                                                                    <div key={att.id} className="max-w-full">
                                                                        {isImage ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setPreviewImage({ src: fileUrl, alt: att.file_name })}
                                                                                className="block focus:outline-none"
                                                                            >
                                                                                <img
                                                                                    src={fileUrl}
                                                                                    alt={att.file_name}
                                                                                    className="rounded-lg max-h-48 object-cover border border-gray-200"
                                                                                />
                                                                            </button>
                                                                        ) : isVideo ? (
                                                                            <video controls className="w-full max-h-56 rounded-lg border border-gray-200">
                                                                                <source src={fileUrl} type={att.mime_type || 'video/mp4'} />
                                                                            </video>
                                                                        ) : isAudio ? (
                                                                            <audio controls className="w-full">
                                                                                <source src={fileUrl} type={att.mime_type || 'audio/mpeg'} />
                                                                            </audio>
                                                                        ) : (
                                                                            <a
                                                                                href={fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center space-x-2 text-xs text-[#008069] hover:underline"
                                                                            >
                                                                                <span className="font-medium truncate max-w-[180px]">{att.file_name}</span>
                                                                                {att.human_file_size && (
                                                                                    <span className="text-gray-500">{att.human_file_size}</span>
                                                                                )}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Text message */}
                                                    {!(
                                                        Array.isArray(msg.attachments) &&
                                                        msg.attachments.length > 0 &&
                                                        msg.message === msg.attachments[0].file_name
                                                    ) && (
                                                            <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                                                        )}

                                                    <div className="flex items-center justify-end space-x-1 mt-1">
                                                        <span className="text-[10px] text-gray-600">
                                                            {formatMessageTime(msg.created_at)}
                                                        </span>
                                                        {msg.user_id === currentUser?.id && !msg.temp && (
                                                            <span className="text-gray-600">
                                                                {msg.is_read ? (
                                                                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {otherUserTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {showEmojiPicker && (
                                <div className="absolute bottom-20 right-4 z-10">
                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                            )}

                            {/* Input Form */}
                            <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-[#f0f2f5]">
                                {speechError && (
                                    <div className="mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                                        <div className="flex items-start justify-between">
                                            <span className="flex-1">{speechError}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSpeechError(null)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isListening && (
                                    <div className="mb-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center justify-between">
                                        <span>🎤 Listening... Speak now</span>
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    </div>
                                )}
                                {isRecording && (
                                    <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                                        <span>Recording voice message... Tap the mic again to stop.</span>
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                )}
                                {selectedFile && (
                                    <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {selectedFile.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                                        <FileText className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={uploadFile}
                                                    disabled={uploadingFile}
                                                    className="px-4 py-2 bg-[#00a884] text-white rounded-lg hover:bg-[#008069] disabled:opacity-50 text-sm font-medium"
                                                >
                                                    {uploadingFile ? 'Uploading...' : 'Send'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={clearSelectedFile}
                                                    disabled={uploadingFile}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Smile className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleVoiceInput}
                                        className={`p - 2 rounded - full transition - colors ${isListening ? 'bg-blue-100 text-blue-600 animate-pulse' : 'hover:bg-gray-200'} `}
                                        title={isListening ? 'Stop listening' : 'Start voice input'}
                                    >
                                        <Mic className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#008069] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}