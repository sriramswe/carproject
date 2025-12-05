// Profile.jsx - Redesigned for a Car Selling Project with Integrated Chat
import React, { useState, useEffect, useRef, Fragment } from "react";
import { useAuth } from "../Components/AuthContext";
import { Link } from "react-router-dom";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const defaultAvatar = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const initialProfileState = { id: null, name: "", email: "", phone: "", avatarPath: "" };

export default function Profile() {
  const { token, user } = useAuth(); // Assume useAuth also provides the logged-in user object
  const fileInputRef = useRef(null);
  const chatMessagesRef = useRef(null); // Ref for scrolling chat to bottom

  // State for profile and cars
  const [profileData, setProfileData] = useState(initialProfileState);
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for chat
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The user object of the person we are chatting with
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inputText, setInputText] = useState('');

  // State for dynamic visibility
  const [visibleSections, setVisibleSections] = useState({
    conversations: true,
    chat: true,
    listings: true,
  });

  // General error/success messages
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("You must be logged in to view your profile.");
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, carsRes, convosRes] = await Promise.all([
          fetch("http://localhost:8080/api/users/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:8080/api/users/my-cars", { headers: { Authorization: `Bearer ${token}` } }),
          // NOTE: You need to create this backend endpoint
          fetch("http://localhost:8080/api/chat/conversations", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!profileRes.ok) throw new Error("Could not fetch profile data.");
        if (!carsRes.ok) throw new Error("Could not fetch your car listings.");
        if (!convosRes.ok) throw new Error("Could not fetch conversations.");

        const profile = await profileRes.json();
        const cars = await carsRes.json();
        const convos = await convosRes.json();

        setProfileData(profile);
        setMyCars(cars);
        setConversations(convos);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    if (!token || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/user/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          // Only add the message to the current view if the chat is active
          setActiveChat(currentActiveChat => {
            if (currentActiveChat && receivedMessage.senderId === currentActiveChat.id) {
              setMessages(prev => [...prev, receivedMessage]);
            }
            return currentActiveChat;
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
    });

    client.activate();
    setStompClient(client);

    return () => { client?.deactivate(); };
  }, [token, user]);

  // --- CHAT HISTORY & SCROLLING ---
  useEffect(() => {
    // Scroll to the bottom of the chat window when new messages arrive
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSelectConversation = async (contact) => {
    if (activeChat?.id === contact.id) return;
    
    setActiveChat(contact);
    setMessages([]); // Clear previous messages
    
    try {
        const res = await fetch(`http://localhost:8080/api/chat/history/${contact.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch chat history.");
        const history = await res.json();
        setMessages(history);
    } catch (err) {
        setError(err.message);
    }
  };
  
  const sendMessage = () => {
    if (inputText.trim() && stompClient && isConnected && activeChat) {
      const chatMessage = {
        senderId: user.id,
        recipientId: activeChat.id,
        content: inputText,
      };

      stompClient.publish({
        destination: `/app/chat/${activeChat.id}`,
        body: JSON.stringify(chatMessage),
      });

      // Optimistic UI update
      setMessages(prev => [...prev, { ...chatMessage, timestamp: new Date().toISOString() }]);
      setInputText('');
    }
  };

  // Toggle visibility of sections
  const toggleSection = (section) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) { /* ... loading spinner ... */ }
  if (error) { /* ... error message ... */ }

  return (
    <Fragment>
      <main className="profile-page-container">
        {/* TOP PROFILE BANNER (Same as before) */}
        <div className="profile-banner card">
             <div className="profile-avatar-section">
                <img src={profileData.avatarPath ? `http://localhost:8080${profileData.avatarPath}` : defaultAvatar} alt="Profile Avatar" className="profile-avatar"/>
                <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>Change Photo</button>
             </div>
             <div className="profile-details-section">
                <h2>{profileData.name}</h2>
                <p className="text-muted">{profileData.email}</p>
                <p className="text-muted">{profileData.phone || "No phone number added"}</p>
                <Link to="/account/update" className="btn btn-default mt-2">Edit Profile</Link>
             </div>
        </div>

        {/* SECTION VISIBILITY CONTROLS */}
        <div className="section-controls card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <h4>Show/Hide Sections:</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={visibleSections.conversations} 
                onChange={() => toggleSection('conversations')}
              />
              <span>Conversations</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={visibleSections.chat} 
                onChange={() => toggleSection('chat')}
              />
              <span>Chat</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={visibleSections.listings} 
                onChange={() => toggleSection('listings')}
              />
              <span>My Listings</span>
            </label>
          </div>
        </div>
        
        {/* MAIN DASHBOARD GRID */}
        <div className="dashboard-grid">

          {/* Column 1: Conversations */}
          {visibleSections.conversations && (
            <aside className="conversations-panel card">
              <div className="panel-header">
                <h3>Conversations</h3>
                <button className="btn btn-sm" onClick={() => toggleSection('conversations')} title="Toggle conversations">
                  ✕
                </button>
              </div>
              <ul className="conversations-list">
                {conversations.map(convo => (
                  <li key={convo.id} onClick={() => handleSelectConversation(convo)} className={activeChat?.id === convo.id ? 'active' : ''}>
                    <img src={convo.avatarPath ? `http://localhost:8080${convo.avatarPath}` : defaultAvatar} alt={convo.name} />
                    <span>{convo.name}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Column 2: Active Chat Window */}
          {visibleSections.chat && (
            <section className="chat-panel card">
              <div className="panel-header chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Chat with {activeChat?.name || 'Select a conversation'}</h3>
                  {activeChat && (
                    <span className={isConnected ? 'status-online' : 'status-offline'}>{isConnected ? 'Connected' : 'Offline'}</span>
                  )}
                </div>
                <button className="btn btn-sm" onClick={() => toggleSection('chat')} title="Toggle chat">
                  ✕
                </button>
              </div>
              {activeChat ? (
                <Fragment>
                  <div className="chat-messages" ref={chatMessagesRef}>
                      {messages.map((msg, index) => (
                          <div key={index} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                              <p>{msg.content}</p>
                              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                      ))}
                  </div>
                  <div className="chat-input-area">
                      <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." disabled={!isConnected} />
                      <button onClick={sendMessage} disabled={!isConnected}>Send</button>
                  </div>
                </Fragment>
              ) : (
                <div className="no-chat-selected">
                  <h3>Select a conversation to start chatting</h3>
                </div>
              )}
            </section>
          )}

          {/* Column 3: My Car Listings */}
          {visibleSections.listings && (
            <aside className="profile-listings-panel card">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>My Listings</h3>
                <div>
                  <Link to="/create" className="btn btn-primary btn-sm">+ New Car</Link>
                  <button className="btn btn-sm" onClick={() => toggleSection('listings')} title="Toggle listings" style={{ marginLeft: '0.5rem' }}>
                    ✕
                  </button>
                </div>
              </div>
               <div className="listings-grid-condensed">
                  {myCars.length > 0 ? (
                      myCars.map((car) => (
                          <div key={car.id} className="car-listing-card-condensed">
                              <img src={car.imageUrls?.[0] || 'https://via.placeholder.com/150x100?text=No+Image'} alt={`${car.makerName} ${car.modelName}`} />
                              <div className="details">
                                  <h4>{`${car.year} ${car.makerName}`}</h4>
                                  <p>${car.price.toLocaleString()}</p>
                                  <div className="actions">
                                      <Link to={`/view/${car.id}`} className="btn btn-xs btn-default">View</Link>
                                      <button onClick={() => handleDeleteCar(car.id)} className="btn btn-xs btn-danger">Del</button>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : <p className="p-1">No cars listed yet.</p>}
              </div>
            </aside>
          )}
        </div>
      </main>
    </Fragment>
  );
}