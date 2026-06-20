import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Users, 
  PenTool, 
  Tv, 
  ChevronLeft, 
  ChevronRight, 
  Hand, 
  LogOut, 
  AlertCircle, 
  Sparkles, 
  Send,
  Trash2,
  Lock,
  Compass
} from 'lucide-react';

const SLIDE_DECK = [
  {
    title: "Introduction to Software Engineering",
    bullets: [
      "Overview of the software development ecosystem",
      "Defining high-quality, maintainable, and scalable software",
      "The role of engineers in modern product cycles"
    ]
  },
  {
    title: "Software Development Life Cycle (SDLC)",
    bullets: [
      "Requirements gathering and analysis analysis",
      "Architectural planning and system design",
      "Implementation (Coding), Testing, Deployment, and Maintenance"
    ]
  },
  {
    title: "Agile & Scrum Framework",
    bullets: [
      "Iterative development and rapid prototyping",
      "Roles: Product Owner, Scrum Master, Development Team",
      "Scrum ceremonies: Daily Standups, Sprint Planning, Retrospectives"
    ]
  },
  {
    title: "Object-Oriented Design Principles",
    bullets: [
      "Solid Principles (Single Responsibility, Open/Closed, etc.)",
      "Encapsulation, Inheritance, Polymorphism, Abstraction",
      "Structuring code for flexibility and unit testing"
    ]
  },
  {
    title: "System Architecture Styles",
    bullets: [
      "Monoliths vs Microservices architectures",
      "Event-Driven design and WebSockets communication",
      "Database selection: Relational (SQL) vs Document (NoSQL)"
    ]
  }
];

const LectureRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  // Authentication gating
  const [isVerified, setIsVerified] = useState(user?.role !== 'student');
  const [googleEmail, setGoogleEmail] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Classroom status
  const [lecture, setLecture] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat or participants
  const [centerMode, setCenterMode] = useState('slides'); // whiteboard or slides

  // Media streams
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Synchronized States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Whiteboard drawing variables
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const drawingPathRef = useRef([]);
  const [drawColor, setDrawColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [whiteboardPaths, setWhiteboardPaths] = useState([]);

  const isTeacher = user?.role === 'teacher';

  // 1. Fetch Lecture details on load
  const fetchLectureDetails = async () => {
    try {
      const res = await api.get(`/lectures/${meetingId}`);
      setLecture(res.data.data);
      setIsActive(res.data.data.isActive);
    } catch (err) {
      console.error(err);
      alert('Error loading meeting details or unauthorized access.');
      navigate('/lectures');
    }
  };

  useEffect(() => {
    fetchLectureDetails();
  }, [meetingId]);

  // 2. Google OAuth / Mock verification loading
  useEffect(() => {
    if (user?.role === 'student' && !isVerified) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.google?.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLoginSuccess
          });
          window.google?.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        };
        document.body.appendChild(script);
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      }
    }
  }, [isVerified, user]);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.post(`/lectures/${meetingId}/join`, {
        googleIdToken: credentialResponse.credential
      });
      setIsVerified(true);
      setGoogleEmail(res.data.data.verifiedEmail);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMockJoin = async (e) => {
    e.preventDefault();
    if (!mockEmail) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.post(`/lectures/${meetingId}/join`, {
        email: mockEmail,
        googleIdToken: 'mock_token'
      });
      setIsVerified(true);
      setGoogleEmail(res.data.data.verifiedEmail);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. User Media (Webcam) logic
  useEffect(() => {
    if (!isVerified) return;

    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Webcam or Microphone permission denied', err);
      }
    };

    enableWebcam();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVerified]);

  // Handle Mute/Unmute & Camera On/Off
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
        setCameraActive(!cameraActive);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    }
  };

  // 4. Synchronization (Polling)
  const pollLectureState = async () => {
    if (!isVerified) return;
    try {
      const res = await api.get(`/lectures/${meetingId}/state`);
      const { isActive: live, currentSlide: slide, chatMessages: chats, participants: parts, whiteboardData: board } = res.data.data;
      
      setIsActive(live);
      setChatMessages(chats);
      setParticipants(parts);
      
      // Sync slide index for students
      if (!isTeacher) {
        setCurrentSlide(slide);
      }

      // Sync Whiteboard paths (only parse if whiteboard data is different)
      try {
        const parsedPaths = JSON.parse(board);
        setWhiteboardPaths(parsedPaths);
      } catch (e) {
        console.error('Error parsing whiteboard data:', e);
      }
    } catch (err) {
      console.error('State polling error:', err);
    }
  };

  useEffect(() => {
    if (!isVerified) return;

    // Run immediately and poll every 2.5 seconds
    pollLectureState();
    const interval = setInterval(pollLectureState, 2500);

    return () => clearInterval(interval);
  }, [isVerified]);

  // 5. Drawing canvas lifecycle
  useEffect(() => {
    if (centerMode !== 'whiteboard' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Make canvas display crisp on high DPI screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw all paths in whiteboardPaths list
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    whiteboardPaths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.isEraser ? '#ffffff' : path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Map percentages back to current canvas dimensions
      const startX = path.points[0].x * canvas.width;
      const startY = path.points[0].y * canvas.height;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < path.points.length; i++) {
        const x = path.points[i].x * canvas.width;
        const y = path.points[i].y * canvas.height;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }, [centerMode, whiteboardPaths]);

  // Draw event handlers (Teacher only)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) / canvas.width;
    const y = (clientY - rect.top) / canvas.height;

    return { x, y };
  };

  const handleStartDraw = (e) => {
    if (!isTeacher || centerMode !== 'whiteboard') return;
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    drawingPathRef.current = [coords];
  };

  const handleDrawing = (e) => {
    if (!isDrawingRef.current || !isTeacher) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    
    drawingPathRef.current.push(coords);

    // Render immediately on teacher screen
    ctx.beginPath();
    ctx.strokeStyle = isEraser ? '#ffffff' : drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = drawingPathRef.current;
    const prev = points[points.length - 2];
    ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
    ctx.lineTo(coords.x * canvas.width, coords.y * canvas.height);
    ctx.stroke();
  };

  const handleStopDraw = async () => {
    if (!isDrawingRef.current || !isTeacher) return;
    isDrawingRef.current = false;

    if (drawingPathRef.current.length < 2) return;

    // Push new path to current list
    const newPath = {
      points: drawingPathRef.current,
      color: drawColor,
      width: brushSize,
      isEraser
    };

    const updatedPaths = [...whiteboardPaths, newPath];
    setWhiteboardPaths(updatedPaths);

    // Save state to backend
    try {
      await api.put(`/lectures/${meetingId}/state`, {
        whiteboardData: JSON.stringify(updatedPaths)
      });
    } catch (e) {
      console.error('Failed to save drawing stroke:', e);
    }
  };

  const handleClearWhiteboard = async () => {
    if (!isTeacher) return;
    setWhiteboardPaths([]);
    try {
      await api.put(`/lectures/${meetingId}/state`, {
        whiteboardData: '[]'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Interactive slide navigation (Teacher only)
  const handleSlideChange = async (direction) => {
    if (!isTeacher) return;
    let nextSlide = currentSlide;
    if (direction === 'next' && currentSlide < SLIDE_DECK.length - 1) {
      nextSlide = currentSlide + 1;
    } else if (direction === 'prev' && currentSlide > 0) {
      nextSlide = currentSlide - 1;
    }
    setCurrentSlide(nextSlide);
    try {
      await api.put(`/lectures/${meetingId}/state`, { currentSlide: nextSlide });
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Send chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageText = chatInput;
    setChatInput('');

    // Pre-append to local state for fast UI response
    const tempMsg = {
      senderName: user.name,
      senderRole: user.role,
      senderEmail: user.email,
      message: messageText,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, tempMsg]);

    try {
      await api.put(`/lectures/${meetingId}/state`, {
        chatMessage: messageText
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Raise hand notification
  const handleRaiseHand = async () => {
    if (handRaised) return;
    setHandRaised(true);
    
    try {
      await api.put(`/lectures/${meetingId}/state`, {
        chatMessage: "raised hand ✋"
      });
      setTimeout(() => setHandRaised(false), 5000);
    } catch (err) {
      setHandRaised(false);
    }
  };

  // Close Meeting (Teacher ends class, Student leaves)
  const handleLeaveMeeting = async () => {
    const confirmText = isTeacher 
      ? "Do you want to end this lecture for everyone?" 
      : "Are you sure you want to leave the lecture room?";
    
    if (!window.confirm(confirmText)) return;

    if (isTeacher) {
      try {
        await api.put(`/lectures/${meetingId}/state`, { isActive: false });
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/lectures');
  };

  // --- Auth Verification Lock View ---
  if (user?.role === 'student' && !isVerified) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-6">
            <Lock className="h-7 w-7 text-indigo-400" />
          </div>

          <h2 className="text-xl font-bold text-center text-white">Gmail Access Verification</h2>
          <p className="text-slate-400 text-xs text-center mt-2 leading-relaxed">
            This live classroom is restricted to authorized attendees. You must verify your identity using your official university Google email account.
          </p>

          {authError && (
            <div className="alert-error mt-5 text-xs p-3.5 border border-red-950 bg-red-950/20">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-red-400">{authError}</span>
            </div>
          )}

          {/* Real Google Button Container */}
          <div className="mt-8 space-y-4">
            <div id="google-signin-btn" className="w-full min-h-[44px]" />

            {/* Developer Mode/Simulated Input Trigger */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center mb-3">
                Or Use Demonstration Login
              </p>
              
              <form onSubmit={handleMockJoin} className="space-y-3">
                <input 
                  type="email"
                  placeholder="Enter official email (e.g. name@lms.edu)"
                  value={mockEmail}
                  onChange={e => setMockEmail(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-900 border border-slate-850 text-white rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-755 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  {authLoading ? (
                    <>Verifying...</>
                  ) : (
                    <>Verify Gmail Identity & Join <Sparkles className="h-3.5 w-3.5 text-indigo-400" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <button 
            onClick={() => navigate('/lectures')}
            className="w-full mt-6 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-400 text-center transition-colors block"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    );
  }

  // --- Main Classroom Fullscreen Interface ---
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen w-screen overflow-hidden">
      {/* 1. Header Bar */}
      <header className="h-16 border-b border-slate-900 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLeaveMeeting}
            className="h-9 w-9 rounded-lg border border-slate-800 hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide max-w-[200px] md:max-w-md truncate">
                {lecture?.title || 'Online Lecture Session'}
              </h1>
              {isActive ? (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              ) : (
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {lecture?.course?.code} · Assigned by {lecture?.teacher?.name}
            </p>
          </div>
        </div>

        {/* Sync Controls (Teacher only) */}
        <div className="flex items-center gap-2.5">
          {isTeacher && (
            <div className="p-1 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-1.5">
              <button 
                onClick={() => setCenterMode('slides')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  centerMode === 'slides' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="h-3.5 w-3.5" /> Presentation
              </button>
              <button 
                onClick={() => setCenterMode('whiteboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  centerMode === 'whiteboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="h-3.5 w-3.5" /> Whiteboard
              </button>
            </div>
          )}
          {!isTeacher && (
            <div className="px-3 py-1.5 bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 text-[10px] font-bold uppercase rounded-xl tracking-wider">
              {centerMode === 'slides' ? '📺 Slides View synced' : '🎨 Whiteboard View synced'}
            </div>
          )}
        </div>
      </header>

      {/* 2. Middle Main Dashboard Panel */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {/* A. Left Sidebar: Webcam Feeds */}
        <div className="w-[20%] max-w-[280px] bg-slate-950/80 border-r border-slate-900 flex flex-col p-4 gap-4 overflow-y-auto shrink-0 select-none">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Video Streams</div>
          
          {/* User Stream */}
          <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner group">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`h-full w-full object-cover transform -scale-x-100 ${
                cameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
                <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <VideoOff className="h-5 w-5 text-slate-500" />
                </div>
                <span className="text-[9px] text-slate-500">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 backdrop-blur rounded text-[9px] font-semibold">
              {user?.name} (You)
            </div>
          </div>

          {/* Teacher or Alternate Stream (Simulated Classroom Roommate/Instructor) */}
          <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner group">
            {isActive ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-3">
                {/* Loop animation or placeholder */}
                <div className="relative h-11 w-11 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-bounce">
                  <Compass className="h-6 w-6 text-indigo-400" />
                </div>
                <span className="text-[10px] font-bold mt-2 text-indigo-300 uppercase tracking-widest">Active Stream</span>
                <span className="text-[9px] text-indigo-400 mt-1">Live from presenter</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50">
                <VideoOff className="h-5 w-5 text-slate-600" />
                <span className="text-[9px] text-slate-500 mt-1.5">No Active Presenter</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 backdrop-blur rounded text-[9px] font-semibold">
              {isTeacher ? 'Student Feeds' : `${lecture?.teacher?.name} (Instructor)`}
            </div>
          </div>
        </div>

        {/* B. Center Area: Canvas Whiteboard / Slide Presentation */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative">
          
          {/* Main Whiteboard Canvas */}
          <div className={`flex-1 relative min-h-0 flex flex-col ${centerMode === 'whiteboard' ? 'block' : 'hidden'}`}>
            {isTeacher && (
              <div className="absolute top-4 left-4 z-10 p-2 bg-slate-950/80 backdrop-blur border border-slate-850 rounded-xl flex items-center gap-3 shadow-lg select-none">
                {/* Brush Colors */}
                <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
                  {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                    <button 
                      key={color}
                      onClick={() => { setDrawColor(color); setIsEraser(false); }}
                      className={`h-5 w-5 rounded-full border border-slate-800 transition-transform ${
                        drawColor === color && !isEraser ? 'scale-125 ring-1 ring-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {/* Mode Selectors */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEraser(false)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      !isEraser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pen
                  </button>
                  <button 
                    onClick={() => setIsEraser(true)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      isEraser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Eraser
                  </button>
                  <button 
                    onClick={handleClearWhiteboard}
                    className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
              </div>
            )}
            
            <canvas 
              ref={canvasRef}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawing}
              onMouseUp={handleStopDraw}
              onMouseLeave={handleStopDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawing}
              onTouchEnd={handleStopDraw}
              className={`flex-1 bg-white cursor-crosshair ${
                isTeacher ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            />
          </div>

          {/* Presentation Deck Component */}
          <div className={`flex-1 flex flex-col items-center justify-center p-6 md:p-12 ${centerMode === 'slides' ? 'block' : 'hidden'}`}>
            <div className="w-full max-w-4xl bg-slate-950 border border-slate-850 rounded-2xl aspect-video shadow-2xl flex flex-col justify-between p-8 relative overflow-hidden select-none">
              
              {/* Slides Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

              <div className="flex justify-between items-start z-10">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Lecture Slides</span>
                <span className="text-xs text-slate-500 font-medium">Slide {currentSlide + 1} of {SLIDE_DECK.length}</span>
              </div>

              <div className="z-10 py-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {SLIDE_DECK[currentSlide].title}
                </h2>
                <ul className="mt-6 space-y-3.5 max-w-2xl">
                  {SLIDE_DECK[currentSlide].bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Slider Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-900 z-10">
                <p className="text-[10px] text-slate-500 font-semibold">{lecture?.course?.code} · {lecture?.course?.name}</p>
                {isTeacher && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSlideChange('prev')} 
                      disabled={currentSlide === 0}
                      className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      onClick={() => handleSlideChange('next')} 
                      disabled={currentSlide === SLIDE_DECK.length - 1}
                      className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* C. Right Sidebar: Chat / Participants Lists */}
        <aside className="w-80 bg-slate-900/60 border-l border-slate-900 flex flex-col min-h-0 shrink-0">
          
          {/* Navigation/Toggle Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-900 bg-slate-950 p-1 flex-shrink-0 select-none">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Chat
            </button>
            <button 
              onClick={() => setActiveTab('participants')}
              className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'participants' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" /> Students ({participants.length})
            </button>
          </div>

          {/* Tab 1: Chat Message Roster */}
          <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {chatMessages.map((msg, idx) => {
                const isMyMessage = msg.senderEmail === user.email;
                const initials = msg.senderName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'ST';
                const roleBadgeColor = msg.senderRole === 'teacher' ? 'text-indigo-400' : 'text-slate-400';
                
                return (
                  <div key={idx} className={`flex gap-2.5 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-700">
                      {initials}
                    </div>
                    <div className={`max-w-[75%] ${isMyMessage ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-0.5">
                        <span className="truncate max-w-[100px]">{msg.senderName}</span>
                        <span className={`text-[8px] uppercase ${roleBadgeColor}`}>{msg.senderRole}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMyMessage 
                          ? 'bg-indigo-650 text-white rounded-tr-none' 
                          : 'bg-slate-900 text-slate-200 border border-slate-850 rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-900 bg-slate-950 flex gap-2 flex-shrink-0">
              <input 
                type="text" 
                placeholder="Type message..." 
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Tab 2: Participants List */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${activeTab === 'participants' ? 'block' : 'hidden'}`}>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Verified Attendance</div>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No students have joined yet.</div>
            ) : participants.map((p, idx) => {
              const studentName = p.student?.name || 'Student';
              const studentInitials = studentName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
              
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-900/20 text-indigo-400 font-bold border border-indigo-900/30 flex items-center justify-center text-xs shrink-0">
                      {studentInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{studentName}</p>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">verified: {p.gmail}</p>
                    </div>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shrink-0" title="Online" />
                </div>
              );
            })}
          </div>

        </aside>
      </div>

      {/* 3. Bottom Control Bar */}
      <footer className="h-16 border-t border-slate-900 bg-slate-950 px-6 flex items-center justify-between flex-shrink-0 select-none">
        
        {/* Verification Status details */}
        <div className="flex items-center gap-2">
          {user?.role === 'student' && googleEmail && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Gmail: {googleEmail}
            </div>
          )}
          {isTeacher && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-950/40 border border-indigo-900/40 rounded-xl text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              Instructor Panel
            </div>
          )}
        </div>

        {/* Audio / Video Toggles */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMic}
            className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
              micActive 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
            }`}
          >
            {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={toggleCamera}
            className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
              cameraActive 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
            }`}
          >
            {cameraActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {!isTeacher && (
            <button 
              onClick={handleRaiseHand}
              disabled={handRaised}
              className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                handRaised 
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Hand className="h-4.5 w-4.5" /> {handRaised ? 'Hand Raised' : 'Raise Hand'}
            </button>
          )}
        </div>

        {/* End / Leave Class Button */}
        <div>
          <button 
            onClick={handleLeaveMeeting}
            className={`h-10 px-5 text-xs font-bold rounded-xl flex items-center gap-2 border transition-colors ${
              isTeacher 
                ? 'bg-red-650 hover:bg-red-700 text-white border-red-700' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LogOut className="h-4.5 w-4.5" />
            {isTeacher ? 'End Lecture' : 'Leave Class'}
          </button>
        </div>

      </footer>
    </div>
  );
};

export default LectureRoom;
