import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery, useSendMessageMutation, useGetConversationQuery, useEditMessageMutation, useDeleteMessageMutation } from "../../features/ApplicationApi";

const parseToken = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Chat = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUserId = token ? parseToken(token)?.id : null;

    const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
    const usersData = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.users || usersResponse?.data || []);

    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editText, setEditText] = useState("");
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [chatBg, setChatBg] = useState(() => localStorage.getItem("chatBg") || "#f9fafb");

    const handleBgChange = (e) => {
        setChatBg(e.target.value);
        localStorage.setItem("chatBg", e.target.value);
    };
    const fileInputRef = useRef();
    const bottomRef = useRef();

    const [sendMessage] = useSendMessageMutation();
    const [editMessage] = useEditMessageMutation();
    const [deleteMessage] = useDeleteMessageMutation();

    const { data: conversation = [], refetch } = useGetConversationQuery(
        { sender: currentUserId, receiver: selectedUser?._id },
        { skip: !selectedUser || !currentUserId, pollingInterval: 3000 }
    );

    useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

    const isMine = (m) => {
        const sid = m.sender?._id || m.sender;
        return sid?.toString() === currentUserId;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setAttachedFile(null);
        } else {
            setAttachedFile(file);
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() && !imageFile && !attachedFile) return;
        const formData = new FormData();
        formData.append("receiver", selectedUser._id);
        if (newMessage.trim()) formData.append("text", newMessage.trim());
        if (imageFile) formData.append("file", imageFile);
        if (attachedFile) formData.append("file", attachedFile);
        await sendMessage(formData);
        setNewMessage("");
        setImageFile(null);
        setImagePreview(null);
        setAttachedFile(null);
        refetch();
    };

    const handleEdit = async (id) => {
        if (!editText.trim()) return;
        await editMessage({ id, text: editText });
        setEditingMsg(null);
        setEditText("");
        refetch();
    };

    const handleDelete = async (id) => {
        await deleteMessage(id);
        setMenuOpenId(null);
        refetch();
    };

    const getInitial = (user) => (user?.name || user?.email || "?").charAt(0).toUpperCase();

    return (
        <div className="flex h-screen pt-16" onClick={() => setMenuOpenId(null)}>
            {/* Sidebar */}
            <div className="w-72 bg-white border-r flex flex-col">
                <div className="p-4 border-b bg-blue-600 text-white font-bold">Chats</div>
                <div className="overflow-y-auto flex-1">
                    {usersLoading ? <p className="p-4">Loading...</p> : usersData?.map((user) => (
                        <div key={user._id} onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${selectedUser?._id === user._id ? "bg-blue-50" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                    {getInitial(user)}
                                </div>
                                <span className="text-sm font-medium">{user.name || user.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col" style={{ backgroundColor: chatBg }}>
                {selectedUser ? (
                    <>
                        <div className="p-4 bg-white border-b font-bold flex justify-between items-center">
                                <span>{selectedUser.name || selectedUser.email}</span>
                                <label className="flex items-center gap-1 text-xs text-gray-500 font-normal">
                                    🎨
                                    <input type="color" value={chatBg} onChange={handleBgChange} className="w-6 h-6 cursor-pointer rounded border-0" title="Chat background color" />
                                </label>
                            </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {conversation.map((m, i) => {
                                const mine = isMine(m);
                                const showDate = i === 0 || conversation[i - 1].date !== m.date;
                                return (
                                    <div key={m._id}>
                                        {showDate && (
                                            <div className="text-center text-xs text-gray-400 my-2">{m.date}</div>
                                        )}
                                        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                            <div className="relative group">
                                                <div className={`p-2 rounded-lg max-w-xs ${mine ? "bg-blue-500 text-white" : "bg-white border"}`}>
                                                    {m.image && (
                                                        <img src={`${BASE_URL}${m.image}`} alt="img"
                                                            className="max-w-xs rounded mb-1 cursor-pointer"
                                                            onClick={() => window.open(`${BASE_URL}${m.image}`, '_blank')} />
                                                    )}
                                                    {m.file && (
                                                        <a href={`${BASE_URL}${m.file}`} target="_blank" rel="noreferrer" download={m.fileName}
                                                            className={`flex items-center gap-2 text-sm underline mb-1 ${isMine(m) ? 'text-blue-100' : 'text-blue-600'}`}>
                                                            📄 {m.fileName || 'Download file'}
                                                        </a>
                                                    )}
                                                    {editingMsg === m._id ? (
                                                        <div className="flex gap-1">
                                                            <input className="text-black border rounded px-1 text-sm" value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && handleEdit(m._id)} autoFocus />
                                                            <button onClick={() => handleEdit(m._id)} className="text-xs bg-white text-blue-600 px-1 rounded">Save</button>
                                                            <button onClick={() => setEditingMsg(null)} className="text-xs text-gray-300">✕</button>
                                                        </div>
                                                    ) : (
                                                        m.text && <p className="text-sm">{m.text}</p>
                                                    )}
                                                    <p className={`text-xs mt-1 ${mine ? "text-blue-100" : "text-gray-400"}`}>{m.time}</p>
                                                </div>

                                                {/* 3-dot menu — only for sender */}
                                                {mine && (
                                                    <div className="absolute top-0 right-0 hidden group-hover:flex">
                                                        <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === m._id ? null : m._id); }}
                                                            className="text-gray-400 hover:text-gray-600 px-1 text-lg leading-none">⋮</button>
                                                        {menuOpenId === m._id && (
                                                            <div className="absolute right-5 top-0 bg-white border rounded shadow z-10 text-sm w-20">
                                                                {m.text && (
                                                                    <button onClick={() => { setEditingMsg(m._id); setEditText(m.text); setMenuOpenId(null); }}
                                                                        className="block w-full text-left px-3 py-1 hover:bg-gray-100">Edit</button>
                                                                )}
                                                                <button onClick={() => handleDelete(m._id)}
                                                                    className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-red-500">Delete</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Image preview */}
                        {imagePreview && (
                            <div className="px-4 pb-2 flex items-center gap-2">
                                <img src={imagePreview} className="h-16 rounded border" alt="preview" />
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 text-sm">Remove</button>
                            </div>
                        )}
                        {attachedFile && (
                            <div className="px-4 pb-2 flex items-center gap-2 text-sm text-gray-600">
                                📄 {attachedFile.name}
                                <button onClick={() => setAttachedFile(null)} className="text-red-500">Remove</button>
                            </div>
                        )}

                        {/* Input bar */}
                        <div className="p-4 bg-white border-t flex gap-2 items-center">
                            <button onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-blue-500 text-xl">📎</button>
                            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={handleImageChange} />
                            <input className="flex-1 border p-2 rounded" value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..." />
                            <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                        </div>
                    </>
                ) : (
                    <div className="m-auto text-gray-400">Select a user to chat</div>
                )}
            </div>
        </div>
    );
};

export default Chat;
