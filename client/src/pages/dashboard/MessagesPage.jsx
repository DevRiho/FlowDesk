import React, { useState, useEffect, useRef } from 'react';
import { communicationService } from '../../services/communicationService';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { MessageSquare, Send, User, Briefcase, Paperclip } from 'lucide-react';
import { formatDate } from '../../utils';

export default function MessagesPage() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load project list
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentWorkspace?._id) return;
      try {
        setLoading(true);
        const res = await businessService.getProjects({});
        const list = res.data?.projects || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProject(list[0]);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentWorkspace?._id]);

  // Load messages & join room when selected project changes
  useEffect(() => {
    if (!selectedProject?._id) return;

    const loadMessages = async () => {
      try {
        const res = await communicationService.getProjectMessages(selectedProject._id);
        setMessages(res.data?.messages || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    if (socket) {
      socket.emit('project:join', selectedProject._id);
    }

    return () => {
      if (socket) {
        socket.emit('project:leave', selectedProject._id);
      }
    };
  }, [selectedProject?._id, socket]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleReceivedMessage = (message) => {
      if (message.project === selectedProject?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('message:received', handleReceivedMessage);

    return () => {
      socket.off('message:received', handleReceivedMessage);
    };
  }, [socket, selectedProject?._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject?._id) return;

    const payload = {
      projectId: selectedProject._id,
      content: newMessage.trim(),
    };

    try {
      setNewMessage('');
      await communicationService.sendMessage(payload);
      // Socket event will automatically append message to thread
    } catch (err) {
      alert('Failed to dispatch message');
    }
  };

  return (
    <div className="h-[calc(100vh-135px)] bg-white rounded-xl border border-surface-200 shadow-sm flex overflow-hidden">
      {/* Channels / Projects Sidebar */}
      <div className="w-80 border-r border-surface-200 flex flex-col bg-surface-50/50 shrink-0">
        <div className="p-4 border-b border-surface-200">
          <h2 className="text-sm font-bold text-surface-900">Project Channels</h2>
          <p className="text-[11px] text-surface-500">Real-time team & client threads</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-surface-100">
          {projects.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedProject(p)}
              className={`w-full text-left p-3.5 transition-colors flex items-center space-x-3 ${
                selectedProject?._id === p._id
                  ? 'bg-brand-50 border-r-2 border-brand-600'
                  : 'hover:bg-surface-100/70'
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  selectedProject?._id === p._id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-200 text-surface-600'
                }`}
              >
                #
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-surface-900 truncate">{p.title}</p>
                <p className="text-[10px] text-surface-500 truncate">{p.client?.company}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-surface-900">#{selectedProject.title}</h3>
                <p className="text-[11px] text-surface-500">
                  Client: {selectedProject.client?.company || 'Internal Project'}
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Socket.IO Connected
              </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-surface-400">
                  No messages in this project channel yet. Send a greeting to start collaborating.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender?._id === user?.id || m.sender === user?.id;
                  return (
                    <div
                      key={m._id}
                      className={`flex items-start space-x-3 ${
                        isMe ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {m.sender?.name?.charAt(0) || 'U'}
                      </div>
                      <div
                        className={`max-w-md rounded-xl p-3 text-xs ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-surface-100 text-surface-900 rounded-tl-none'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-semibold mb-1 ${
                            isMe ? 'text-brand-200' : 'text-surface-500'
                          }`}
                        >
                          {m.sender?.name} &bull; {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <p className="leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-surface-200 flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Message #${selectedProject.title}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-surface-400">
            Select a project channel to begin messaging.
          </div>
        )}
      </div>
    </div>
  );
}

