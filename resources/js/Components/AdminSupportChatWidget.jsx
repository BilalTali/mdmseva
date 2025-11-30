import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircle, X, Send, Minimize2, Smile, Check, CheckCheck, Search, MoreVertical, Archive, Mic, Bot } from 'lucide-react';
import axios from 'axios';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

export default function AdminSupportChatWidget() {
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
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewImage, setPreviewImage] = useState(null); // { src, alt }
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const recordedChunksRef = useRef([]);

    useEffect(() => {
        if (isOpen && !chatId) {
            initializeChat();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (chatId && window.Echo) {
            const channelName = `support-chat.${chatId}`;
            const channel = window.Echo.private(channelName);

            channel.listen('.support.message', (e) => {
                console.log('Event received:', e);
                setMessages(prev => [...prev, e]);
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    useEffect(() => {
        if (isOpen && chatId) {
            const interval = setInterval(() => {
                refreshChatsAndMessages(chatId);
            }, 5000); // Auto-refresh every 5 seconds

            return () => clearInterval(interval);
        }
    }, [isOpen, chatId]);

    const initializeChat = async () => {
        setLoading(true);
        try {
            const listRes = await axios.get('/api/admin/support-chat');
            const chatList = listRes?.data?.data?.chats || [];
            setChats(chatList);

            const selected = chatList[0];
            if (selected) {
                await loadChat(selected.id, chatList);
            }
        } catch (error) {
            console.error('Failed to initialize admin chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadChat = async (id, existingChats = null) => {
        if (!id) return;
        setLoading(true);
        try {
            const showRes = await axios.get(`/api/admin/support-chat/${id}`);
            setChatId(id);
            setSelectedChatId(id);
            setMessages(showRes?.data?.data?.messages || []);

            const list = existingChats || chats;
            const found = list.find(c => c.id === id);
            setUnreadCount(found?.unread_count || 0);
        } catch (error) {
            console.error('Failed to load admin chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshChatsAndMessages = async (currentChatId) => {
        try {
            const listRes = await axios.get('/api/admin/support-chat');
            const chatList = listRes?.data?.data?.chats || [];
            setChats(chatList);

            const activeId = currentChatId || selectedChatId;
            if (activeId) {
                const showRes = await axios.get(`/api/admin/support-chat/${activeId}`);
                setMessages(showRes?.data?.data?.messages || []);

                const found = chatList.find(c => c.id === activeId);
                setUnreadCount(found?.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to refresh admin chats/messages:', error);
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
            is_admin: true,
            created_at: new Date().toISOString(),
            temp: true,
        };

        setMessages(prev => [...prev, tempMessage]);
        const messageText = newMessage;
        setNewMessage('');
        stopTyping();
        setShowEmojiPicker(false);

        try {
            const response = await axios.post('/api/admin/support-chat/message', {
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
            console.error('Failed to send admin message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
    };

    const handleTyping = () => {
        if (!isTyping && chatId) {
            setIsTyping(true);
            axios.post('/api/admin/support-chat/typing', {
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
            axios.post('/api/admin/support-chat/typing', {
                chat_id: chatId,
                is_typing: false,
            });
        }
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

    const handleFileSelect = (e) => {
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
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
            'video/mp4', 'video/webm', 'video/ogg',
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('File type not allowed. Please upload images, audio, video, PDFs, Word, Excel, or text files.');
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
            const response = await axios.post('/api/admin/support-chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.data]);
                clearSelectedFile();
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploadingFile(false);
        }
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
            alert('Please select a conversation before recording.');
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

                const file = new File([blob], `voice-message-${Date.now()}.ogg`, { type: 'audio/ogg' });
                setSelectedFile(file);
                cleanupRecording();
                setIsRecording(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording (admin):', error);
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
            console.error('Error stopping recording (admin):', error);
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

    const filteredChats = chats.filter(chat =>
        chat.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedChat = chats.find(c => c.id === selectedChatId);

    const disableAI = async () => {
        if (!selectedChatId) return;
        try {
            await axios.post(`/api/admin/support-chat/${selectedChatId}/disable-ai`);
            setChats(prev => prev.map(c =>
                c.id === selectedChatId ? { ...c, ai_enabled: false } : c
            ));
        } catch (error) {
            console.error('Failed to disable AI:', error);
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#00a884] to-[#008069] text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-200 z-50 flex items-center justify-center"
                >
                    <MessageCircle className="w-7 h-7" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 animate-bounce">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl z-50 flex transition-all duration-300 ${isMinimized ? 'w-[340px] h-14' : 'w-[720px] h-[540px]'
                    }`}>
                    {!isMinimized ? (
                        <>
                            {/* Image Preview Lightbox */}
                            {previewImage && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 rounded-2xl">
                                    <div className="relative max-w-full max-h-full p-4">
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
                                            className="max-h-[420px] max-w-[520px] rounded-lg shadow-lg object-contain bg-black"
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Left Sidebar - Chat List (WhatsApp Web Style) */}
                            <div className="w-[340px] border-r border-gray-200 flex flex-col rounded-l-2xl">
                                {/* Sidebar Header */}
                                <div className="bg-[#008069] text-white p-4 flex items-center justify-between rounded-tl-2xl">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Admin Support</h3>
                                            <p className="text-xs text-white/70">{chats.length} conversations</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMinimized(true)}
                                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="p-2 bg-gray-50 border-b border-gray-200">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search conversations..."
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Chat List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading && chats.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00a884] border-t-transparent"></div>
                                        </div>
                                    ) : filteredChats.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-20 px-4">
                                            <p className="text-sm">No conversations found</p>
                                        </div>
                                    ) : (
                                        filteredChats.map(chat => (
                                            <div
                                                key={chat.id}
                                                onClick={() => loadChat(chat.id)}
                                                className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${selectedChatId === chat.id ? 'bg-[#f0f2f5]' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                                        {chat.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-semibold text-sm text-gray-900 truncate flex items-center">
                                                                {chat.user?.name || 'Unknown User'}
                                                                {chat.ai_enabled && (
                                                                    <Bot className="w-3 h-3 ml-1 text-purple-500" />
                                                                )}
                                                            </h4>
                                                            {chat.last_message_at && (
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-gray-600 truncate">
                                                                {chat.latest_message?.message || 'No messages yet'}
                                                            </p>
                                                            {chat.unread_count > 0 && (
                                                                <span className="ml-2 min-w-[20px] h-5 bg-[#00a884] text-white text-xs font-semibold rounded-full flex items-center justify-center px-1.5">
                                                                    {chat.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right Side - Chat Window */}
                            <div className="flex-1 flex flex-col rounded-r-2xl">
                                {selectedChat ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-tr-2xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-[#00a884] text-white rounded-full flex items-center justify-center font-semibold">
                                                    {selectedChat.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-900">{selectedChat.user?.name || 'Unknown User'}</h3>
                                                    <p className="text-xs text-gray-500">{selectedChat.user?.email || ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {selectedChat.ai_enabled && (
                                                    <button
                                                        onClick={disableAI}
                                                        className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors mr-2 flex items-center"
                                                        title="Disable AI and take over chat"
                                                    >
                                                        <Bot className="w-3 h-3 mr-1" />
                                                        Take Over
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={toggleChat}
                                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages Area */}
                                        <div
                                            className="flex-1 overflow-y-auto p-4 space-y-2"
                                            style={{
                                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23efeae2\'/%3E%3Cpath d=\'M25 25h50v50H25z\' fill=\'%23e5ddd5\'/%3E%3C/svg%3E")',
                                                backgroundSize: '100px 100px',
                                                backgroundColor: '#efeae2'
                                            }}
                                        >
                                            {loading && messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00a884] border-t-transparent"></div>
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="text-center text-gray-600 mt-32">
                                                    <div className="w-20 h-20 bg-[#00a884]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <MessageCircle className="w-10 h-10 text-[#00a884]" />
                                                    </div>
                                                    <p className="text-sm">No messages in this conversation</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((message, index) => (
                                                        <React.Fragment key={message.id}>
                                                            {shouldShowDateSeparator(index) && (
                                                                <div className="flex justify-center my-3">
                                                                    <div className="bg-white/90 shadow-sm rounded-md px-3 py-1 text-xs font-medium text-gray-600">
                                                                        {getDateSeparator(message.created_at)}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'} mb-1`}>
                                                                <div
                                                                    className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm relative ${message.is_admin
                                                                        ? 'bg-[#d9fdd3]'
                                                                        : 'bg-white'
                                                                        } ${message.temp ? 'opacity-60' : ''}`}
                                                                    style={{
                                                                        borderTopLeftRadius: message.is_admin ? '8px' : '0px',
                                                                        borderTopRightRadius: message.is_admin ? '0px' : '8px'
                                                                    }}
                                                                >
                                                                    {!message.is_admin && (
                                                                        <p className="text-xs text-[#00a884] font-semibold mb-1">
                                                                            {message.sender_name || 'User'}
                                                                        </p>
                                                                    )}
                                                                    {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                                                        <div className="mb-1 space-y-1">
                                                                            {message.attachments.map(att => {
                                                                                const fileUrl = att.file_url || (att.file_path ? `/storage/${att.file_path}` : '');
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
                                                                                                <span className="font-medium truncate max-w-[220px]">{att.file_name}</span>
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
                                                                    {!(
                                                                        Array.isArray(message.attachments) &&
                                                                        message.attachments.length > 0 &&
                                                                        message.message === message.attachments[0].file_name
                                                                    ) && (
                                                                            <p className="text-sm text-gray-900 break-words">{message.message}</p>
                                                                        )}
                                                                    <div className={`flex items-center justify-end space-x-1 mt-1 ${message.is_admin ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                        {message.is_ai_generated && (
                                                                            <span className="bg-purple-100 text-purple-700 text-[10px] font-medium px-1.5 py-0.5 rounded mr-1 border border-purple-200 flex items-center">
                                                                                <Bot className="w-3 h-3 mr-1" /> AI
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[10px]">
                                                                            {formatMessageTime(message.created_at)}
                                                                        </span>
                                                                        {message.is_admin && (
                                                                            <span>
                                                                                {message.is_read ? (
                                                                                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                                                ) : (
                                                                                    <Check className="w-3.5 h-3.5" />
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}

                                                    {otherUserTyping && (
                                                        <div className="flex justify-start mb-1">
                                                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                                                                <div className="flex space-x-1">
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </>
                                            )}
                                        </div>

                                        {/* Emoji Picker */}
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-20 right-4 z-10">
                                                <EmojiPicker
                                                    onEmojiClick={onEmojiClick}
                                                    width={320}
                                                    height={400}
                                                />
                                            </div>
                                        )}

                                        {/* Input Area */}
                                        <form onSubmit={sendMessage} className="p-3 bg-gray-50 border-t border-gray-200 rounded-br-2xl">
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
                                                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                                                <Paperclip className="w-8 h-8 text-gray-400" />
                                                            </div>
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
                                                    className="p-2 text-gray-500 hover:text-[#00a884] rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Smile className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleMicClick}
                                                    className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-[#00a884] hover:bg-gray-100'}`}
                                                >
                                                    <Mic className="w-5 h-5" />
                                                </button>
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => {
                                                        setNewMessage(e.target.value);
                                                        handleTyping();
                                                    }}
                                                    placeholder="Type a message"
                                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent text-sm"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#008069] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-r-2xl">
                                        <div className="text-center text-gray-500">
                                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium">Select a conversation</p>
                                            <p className="text-sm">Choose from the list to start chatting</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-[#008069] text-white p-4 rounded-2xl flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-semibold text-sm">Admin Support ({chats.length})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsMinimized(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={toggleChat}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}