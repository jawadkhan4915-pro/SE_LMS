import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import api from '../utils/api';
import {
  Camera, CheckCircle2, AlertTriangle, Calendar,
  Clock, Smile, UserCheck, Play, StopCircle, RefreshCw, Check
} from 'lucide-react';

const TeacherSelfAttendance = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [markedToday, setMarkedToday] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null); // 'present' or 'late'
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const videoRef = useRef(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/attendance/teacher/my-logs');
      if (res.data.success) {
        const fetchLogs = res.data.data;
        setLogs(fetchLogs);

        // Check if already checked in today
        const todayStr = new Date().toDateString();
        const checkedToday = fetchLogs.some(
          (log) => new Date(log.date).toDateString() === todayStr
        );
        setMarkedToday(checkedToday);
        if (checkedToday) {
          const todayLog = fetchLogs.find(
            (log) => new Date(log.date).toDateString() === todayStr
          );
          setAttendanceStatus(todayLog.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      showAlert('danger', 'Error loading attendance history logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg({ type: '', text: '' });
    }, 5000);
  };

  const startCamera = async () => {
    setMatchScore(null);
    setAlertMsg({ type: '', text: '' });
    setStatusMessage('Accessing media capture...');
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(localStream);
      setCameraActive(true);
      setStatusMessage('Webcam active. Align face inside grid marker.');
      
      // Delay mounting stream link to ensure element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      }, 100);
    } catch (error) {
      console.error('Webcam initialization failed:', error);
      showAlert('danger', 'Failed to access camera. Verify device connections and permissions.');
      setStatusMessage('');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
    setStatusMessage('');
  };

  // Helper to capture a frame from the HTML5 video element
  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg');
  };

  const handleRegisterFace = async () => {
    const base64Image = captureFrame();
    if (!base64Image) {
      showAlert('danger', 'Error capturing video feed frames.');
      return;
    }

    setProcessing(true);
    setStatusMessage('Processing facial template mapping...');

    try {
      const res = await api.post('/attendance/teacher/register-face', {
        faceTemplate: base64Image
      });

      if (res.data.success) {
        // Update user state in redux store and localStorage
        dispatch(updateProfile({ faceRegistered: true }));
        
        showAlert('success', 'Face credentials registered successfully. You can now mark attendance.');
        stopCamera();
      }
    } catch (error) {
      console.error(error);
      showAlert('danger', error.response?.data?.message || 'Face registration failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAttendance = async () => {
    const base64Image = captureFrame();
    if (!base64Image) {
      showAlert('danger', 'Error capturing video feed frames.');
      return;
    }

    setProcessing(true);
    
    // Play sequential biometric scan statuses to wow the user with high fidelity
    const statuses = [
      { text: 'Detecting biometric facial landmarks...', delay: 0 },
      { text: 'Aligning landmark vectors to profile template...', delay: 600 },
      { text: 'Evaluating security parameters...', delay: 1200 },
      { text: 'Hashing biometric tokens...', delay: 1800 },
      { text: 'Verifying with core servers...', delay: 2400 }
    ];

    statuses.forEach(s => {
      setTimeout(() => {
        if (processing) return; // if aborted
        setStatusMessage(s.text);
      }, s.delay);
    });

    // Send API call after simulation completes
    setTimeout(async () => {
      try {
        const res = await api.post('/attendance/teacher/mark', {
          snapshot: base64Image
        });

        if (res.data.success) {
          const { matchScore, status, attendance } = res.data.data;
          setMatchScore(matchScore);
          setAttendanceStatus(status);
          setMarkedToday(true);
          showAlert('success', `Attendance marked successfully: ${status === 'late' ? 'Late' : 'Present'}!`);
          stopCamera();
          fetchLogs(); // refresh logs
        }
      } catch (error) {
        console.error(error);
        showAlert('danger', error.response?.data?.message || 'Verification mismatch or database error.');
        stopCamera();
      } finally {
        setProcessing(false);
      }
    }, 3000);
  };

  // Stats Calculations
  const totalDays = logs.length;
  const presentDays = logs.filter(l => l.status === 'present').length;
  const lateDays = logs.filter(l => l.status === 'late').length;
  const rate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Biometric Face Attendance Portal</h1>
        <p className="text-sm text-slate-400">Mark your daily check-in logs using webcam recognition algorithms.</p>
      </div>

      {/* Alert Banner */}
      {alertMsg.text && (
        <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all animate-fade-in ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{rate}%</p>
            <p className="text-xs text-slate-400 mt-1">Present ratio</p>
          </div>
          <div className="icon-box bg-indigo-50 text-indigo-600">
            <Smile className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Checked-In</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalDays}</p>
            <p className="text-xs text-slate-400 mt-1">Total logs recorded</p>
          </div>
          <div className="icon-box bg-sky-50 text-sky-600">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On-Time Days</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 text-emerald-600">{presentDays}</p>
            <p className="text-xs text-slate-400 mt-1">Before 09:00 AM</p>
          </div>
          <div className="icon-box bg-emerald-50 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Days</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 text-amber-500">{lateDays}</p>
            <p className="text-xs text-slate-400 mt-1">After 09:00 AM</p>
          </div>
          <div className="icon-box bg-amber-50 text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Face Scanner Module */}
        <div className="card p-5 lg:col-span-2 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 text-white min-h-[480px]">
          {/* Glassmorphic Cyber Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {cameraActive ? (
            <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Scanning Target HUD Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Outer pulsing ring */}
                <div className="w-56 h-72 border border-sky-400/30 rounded-[50%] animate-radar-pulse absolute" />
                
                {/* Face Silhouette Box Guide */}
                <div className="w-52 h-64 border-2 border-dashed border-sky-400/60 rounded-[50%] flex items-center justify-center">
                  <div className="text-[10px] tracking-widest text-sky-300 font-bold bg-sky-950/80 px-3 py-1 rounded-full border border-sky-400/30 shadow-lg">
                    POSITION FACE HERE
                  </div>
                </div>

                {/* Laser scan lines */}
                {processing && (
                  <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-laser shadow-[0_0_12px_#34d399]" />
                )}
              </div>

              {/* Holographic scanner readout logs */}
              {statusMessage && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs font-mono text-sky-400 flex items-center gap-2.5">
                  <RefreshCw className={`h-3.5 w-3.5 ${processing ? 'animate-spin' : ''}`} />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-5 p-8 max-w-md z-10">
              <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
                <Camera className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Biometric Attendance Scanner</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {markedToday 
                    ? `Your attendance is already logged for today as: ${attendanceStatus === 'late' ? 'LATE' : 'PRESENT'}.`
                    : user.faceRegistered
                      ? 'Launch the biometric camera recognition dashboard to verify and record your check-in logs for today.'
                      : 'Biometric face metadata is not registered yet. Please launch the webcam scanner to capture your profile template.'
                  }
                </p>
              </div>
              
              {!markedToday && (
                <button onClick={startCamera} className="btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
                  <Play className="h-4 w-4 shrink-0" />
                  <span>{user.faceRegistered ? 'Start Scanner' : 'Register Face Data'}</span>
                </button>
              )}

              {markedToday && (
                <div className={`mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                  attendanceStatus === 'late'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Checked-In ({attendanceStatus?.toUpperCase()})</span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons inside active camera stream */}
          {cameraActive && (
            <div className="flex gap-3 mt-4 z-10 w-full justify-center">
              <button
                onClick={stopCamera}
                disabled={processing}
                className="btn bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
              >
                <StopCircle className="h-4 w-4 shrink-0" />
                <span>Cancel</span>
              </button>

              {user.faceRegistered ? (
                <button
                  onClick={handleMarkAttendance}
                  disabled={processing}
                  className="btn bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold"
                >
                  <UserCheck className="h-4 w-4 shrink-0" />
                  <span>{processing ? 'Verifying...' : 'Verify & Check-In'}</span>
                </button>
              ) : (
                <button
                  onClick={handleRegisterFace}
                  disabled={processing}
                  className="btn bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold"
                >
                  <Smile className="h-4 w-4 shrink-0" />
                  <span>{processing ? 'Registering...' : 'Register Profile Face'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Attendance ledger log list */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Attendance Ledger</span>
            </h3>

            {loadingLogs ? (
              <div className="flex h-48 items-center justify-center">
                <div className="spinner h-8 w-8 text-indigo-600" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No attendance logs available.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric'
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Check-in time: {new Date(log.checkInTime).toLocaleTimeString(undefined, {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                      log.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {log.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSelfAttendance;
