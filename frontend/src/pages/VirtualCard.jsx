import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import jsQR from 'jsqr';
import { 
  CreditCard, 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Printer,
  ChevronRight,
  Info,
  MapPin,
  Phone,
  BookOpen,
  Camera,
  X,
  FileCheck
} from 'lucide-react';
import { useSelector } from 'react-redux';

const VirtualCard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Card Details
  const [card, setCard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flipped, setFlipped] = useState(false);

  // Edit Settings Form
  const [cnic, setCnic] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [authoritySignature, setAuthoritySignature] = useState('');
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Document Upload
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // QR Reader / File Decoder
  const [qrFile, setQrFile] = useState(null);
  const [qrDecoding, setQrDecoding] = useState(false);
  const [qrDecodedData, setQrDecodedData] = useState(null);
  const [qrDecodeError, setQrDecodeError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const fileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchCardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/virtual-card');
      setCard(res.data.data.card);
      setDocuments(res.data.data.documents);
      
      // Populate form
      setCnic(res.data.data.card.cnic || '');
      setEmergencyContact(res.data.data.card.emergencyContact || '');
      setAddress(res.data.data.card.address || '');
      setAuthoritySignature(res.data.data.card.authoritySignature || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load card details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setSettingsSuccess('');
    try {
      const res = await api.put('/virtual-card/settings', {
        cnic,
        emergencyContact,
        address,
        authoritySignature
      });
      setCard(prev => ({
        ...prev,
        ...res.data.data
      }));
      setSettingsSuccess('Card details updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update details.');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadingDoc(true);
    setUploadSuccess('');
    setUploadError('');

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);

    try {
      const res = await api.post('/virtual-card/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [res.data.data, ...prev]);
      setUploadSuccess('Document uploaded and linked successfully!');
      setUploadTitle('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(''), 3500);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document from your QR card?')) return;
    try {
      await api.delete(`/virtual-card/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d._id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  // Decode QR code picture uploaded by student
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setQrFile(file);
    setQrDecoding(true);
    setQrDecodedData(null);
    setQrDecodeError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decoded = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (!decoded) {
            setQrDecodeError('Could not read any QR code. Please make sure the QR code image is clear and centered.');
            setQrDecoding(false);
            return;
          }

          const qrUrl = decoded.data;
          console.log('Decoded QR URL:', qrUrl);

          // Parse user id out of the URL (e.g. /verify/card/userId)
          const match = qrUrl.match(/\/verify\/card\/([a-f0-9]+)/i);
          if (!match || !match[1]) {
            setQrDecodeError('This is not a valid KFUEIT Virtual Card QR code.');
            setQrDecoding(false);
            return;
          }

          const decodedUserId = match[1];
          // Fetch card details for decoded user
          const response = await api.get(`/virtual-card/public/${decodedUserId}`);
          setQrDecodedData({
            card: response.data.data.card,
            documents: response.data.data.documents,
            userId: decodedUserId
          });
          setShowQrModal(true);
        } catch (err) {
          console.error(err);
          setQrDecodeError('Failed to fetch details for this QR code. The account may have been disabled.');
        } finally {
          setQrDecoding(false);
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-500">Generating digital card credentials...</p>
      </div>
    </div>
  );

  const isStudent = card.role === 'student';
  const verificationUrl = `${window.location.origin}/verify/card/${user?._id}`;

  const universityIssuedDocs = documents.filter(doc => doc.uploadedByRole === 'university');
  const selfUploadedDocs = documents.filter(doc => doc.uploadedByRole === 'self');

  return (
    <div className="space-y-6">
      {/* Styles for printing ID card */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-650" />
            Virtual ID Card & Documents
          </h1>
          <p className="page-subtitle">View and print your digital university ID card. Scan or upload your QR code to retrieve your documents.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Printer className="h-4 w-4" /> Print Card
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-danger flex items-center gap-2 no-print">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive print section */}
      <div id="print-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Card Face & Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col items-center gap-5 no-print">
          <div className="text-center">
            <p className="text-xs font-bold text-indigo-650 uppercase tracking-wider">KFUEIT Virtual Card</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click the card or use flip button to turn it over</p>
          </div>

          {/* Interactive Card */}
          <div 
            className="relative w-full max-w-[350px] h-[220px] cursor-pointer perspective"
            onClick={() => setFlipped(!flipped)}
          >
            <div className={`relative w-full h-full duration-500 transform-style transition-transform ${flipped ? 'rotate-y-180' : ''}`}>
              
              {/* CARD FRONT */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-white text-slate-800 shadow-lg border border-slate-200 overflow-hidden backface-hidden flex flex-col justify-between p-3 select-none">
                
                {/* Header Logo */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {/* Mock KFUEIT Logo */}
                    <div className="w-8.5 h-8.5 rounded-full bg-emerald-600 flex items-center justify-center border border-emerald-500 text-white shrink-0 relative overflow-hidden">
                      <span className="font-black text-[9px] relative z-10">UEIT</span>
                    </div>
                    <div>
                      <h2 className="text-[7.5px] font-extrabold text-slate-500 uppercase leading-none tracking-tight">Khwaja Fareed</h2>
                      <h3 className="text-xs font-black text-indigo-900 leading-none">UEIT</h3>
                      <p className="text-[6.5px] font-bold text-slate-400 uppercase leading-none tracking-wider mt-0.5">Rahim Yar Khan</p>
                    </div>
                  </div>
                  {/* Decorative curves */}
                  <div className="text-emerald-500/20 text-xs shrink-0 select-none">
                    <svg width="40" height="12" viewBox="0 0 45 15" fill="none">
                      <path d="M0 2.5C5 2.5 7.5 7.5 12.5 7.5C17.5 7.5 20 2.5 25 2.5C30 2.5 32.5 7.5 37.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Identity Band */}
                <div className="relative my-1 flex items-center justify-between">
                  <div className="absolute inset-0 bg-indigo-900 -mx-3 h-[70px] top-1/2 -translate-y-1/2"></div>
                  
                  <div className="relative z-10 pl-1 py-0.5 text-white space-y-1 max-w-[200px]">
                    <h4 className="font-extrabold text-xs uppercase leading-tight tracking-wide line-clamp-1">{card.name}</h4>
                    <p className="text-[8px] text-indigo-200 font-semibold leading-none">{card.role === 'student' ? 'Student' : 'Faculty Member'}</p>
                    <p className="text-[8px] text-indigo-100 font-medium leading-none line-clamp-1">
                      {isStudent ? 'Software Engineering' : `${card.department || 'SE'} Department`}
                    </p>
                    <p className="text-[8px] font-mono text-white/95 leading-none font-bold">{card.rollNo || 'SWEN241101017'}</p>
                  </div>

                  {/* Profile Picture */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-[68px] h-[78px] rounded-[16px] bg-slate-50 border-[3px] border-indigo-900 shadow-md overflow-hidden flex items-center justify-center">
                      {card.profilePicture ? (
                        <img 
                          src={`${apiBase.replace('/api', '')}${card.profilePicture}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-lg uppercase">
                          {card.name?.slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Front Footer */}
                <div className="flex justify-between items-end text-[7.5px] font-bold text-slate-500 border-t border-slate-100 pt-1.5">
                  <div className="flex items-center gap-0.5">
                    <span>Valid till <span className="text-red-600 font-extrabold">{card.cardValidTill || '2028-07-05'}</span></span>
                  </div>
                  <span className="text-slate-400 uppercase tracking-wider text-[6.5px]">Front Side</span>
                </div>

              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-white text-slate-800 shadow-lg border border-slate-200 overflow-hidden backface-hidden rotate-y-180 flex flex-col justify-between p-3 select-none">
                
                {/* Back Top details */}
                <div className="space-y-1 text-[8px] font-semibold pl-0.5">
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[74px] shrink-0">CNIC:</span>
                    <span className="text-slate-700">{card.cnic || '31301-8039182-3'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[74px] shrink-0">In case emergency:</span>
                    <span className="text-slate-700">{card.emergencyContact || '0306-1389233'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[74px] shrink-0">Address:</span>
                    <span className="text-slate-700 leading-tight line-clamp-2">{card.address || 'Abu Dhabi Road, Rahim Yar Khan'}</span>
                  </div>
                </div>

                {/* Back Signature & QR code */}
                <div className="flex justify-between items-end my-0.5">
                  
                  {/* Signature */}
                  <div className="flex flex-col items-start pl-0.5">
                    <span className="text-[6.5px] font-bold text-indigo-900 uppercase">Authority Signature</span>
                    <div className="h-6 flex items-end justify-start min-w-[80px] border-b border-slate-300 pb-0.5 mt-0.5">
                      {card.authoritySignature ? (
                        <span className="font-signature text-sm text-slate-700 leading-none tracking-wide select-none">
                          {card.authoritySignature}
                        </span>
                      ) : (
                        <span className="text-[6.5px] text-slate-400 italic">Signature</span>
                      )}
                    </div>
                  </div>

                  {/* QR Code linking to verification */}
                  <div className="shrink-0 bg-white p-0.5 border border-slate-200 rounded shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(verificationUrl)}`} 
                      alt="Card QR" 
                      className="w-[50px] h-[50px]"
                    />
                  </div>
                </div>

                {/* Green Bottom Banner */}
                <div className="absolute inset-x-0 bottom-0 bg-emerald-600 px-3 py-1.5 text-white flex justify-between items-center text-[6.5px] leading-tight font-medium">
                  <div>
                    <p className="font-extrabold">Khwaja Fareed University of Engineering & IT</p>
                    <p className="opacity-90">Abu Dhabi Road, Rahim Yar Khan. Tel: +92 68 5882400</p>
                  </div>
                  <span className="font-mono font-bold opacity-80 shrink-0">0003550217</span>
                </div>

              </div>

            </div>
          </div>

          {/* Flip Toggle Button */}
          <div className="flex gap-2 w-full max-w-[350px]">
            <button 
              onClick={() => setFlipped(!flipped)} 
              className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200 text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Flip ID Card Side
            </button>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(verificationUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-sm"
              title="Download High-Res QR Code"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>

          {/* Edit Details panel */}
          <div className="card p-5 w-full max-w-[350px] shadow-sm">
            <h3 className="section-title text-slate-800 text-xs uppercase tracking-wider mb-3">Card Information Settings</h3>
            <form onSubmit={handleUpdateSettings} className="space-y-3 text-xs">
              <div>
                <label className="form-label text-[10px]">CNIC Number</label>
                <input 
                  type="text" 
                  placeholder="31301-8039182-3"
                  className="form-input text-xs py-1.5"
                  value={cnic}
                  onChange={e => setCnic(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-[10px]">In Case of Emergency (Phone)</label>
                <input 
                  type="text" 
                  placeholder="0306-1389233"
                  className="form-input text-xs py-1.5"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-[10px]">Home Address</label>
                <textarea 
                  rows={2}
                  placeholder="Abu Dhabi Road Sem Nala Pull Near Al Huda"
                  className="form-input text-xs py-1.5"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-[10px]">Your Authority / Digital Signature (Text)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jawad Khan"
                  className="form-input font-signature text-sm py-1.5"
                  value={authoritySignature}
                  onChange={e => setAuthoritySignature(e.target.value)}
                />
              </div>

              {settingsSuccess && (
                <div className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {settingsSuccess}
                </div>
              )}

              <button 
                type="submit" 
                disabled={updatingSettings}
                className="w-full btn-primary py-2 text-xs font-bold"
              >
                {updatingSettings ? 'Saving...' : 'Save Backside Details'}
              </button>
            </form>
          </div>
        </div>

        {/* QR Scanner & Documents Panel */}
        <div className="lg:col-span-7 space-y-6 no-print">
          
          {/* Document QR-Code Reader */}
          <div className="card p-5 border border-indigo-150 shadow-sm bg-gradient-to-br from-indigo-50/30 to-indigo-100/10">
            <h3 className="section-title text-indigo-900 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-650" />
              Document Retriever: Scan / Upload Card QR Code
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Upload a picture of any student's or teacher's card QR code to immediately decode it, verify their credentials, and access all associated university and self-uploaded documents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Uploader decoding */}
              <div className="border border-dashed border-indigo-250 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 transition-colors hover:bg-slate-50/50">
                <Upload className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Upload QR Image</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Select a photo of the card QR code</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleQrUpload} 
                  className="hidden" 
                  id="qr-image-upload" 
                />
                <label 
                  htmlFor="qr-image-upload" 
                  className="btn-secondary py-1.5 px-3 text-[10px] font-bold cursor-pointer"
                >
                  {qrDecoding ? 'Reading QR...' : 'Choose QR Photo'}
                </label>
              </div>

              {/* Direct QR Link */}
              <div className="bg-indigo-950 text-white rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-black text-indigo-300">Your QR Scan URL</span>
                  <p className="text-xs font-semibold text-slate-200 leading-normal truncate">{verificationUrl}</p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={verificationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 btn-primary py-1.5 text-[10px] font-bold text-center bg-white text-indigo-950 hover:bg-slate-100 flex items-center justify-center gap-1"
                  >
                    Test Link <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {qrDecodeError && (
              <div className="mt-3 alert-danger py-2 px-3 text-[10px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{qrDecodeError}</span>
              </div>
            )}
          </div>

          {/* User's Documents List */}
          <div className="card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="section-title text-slate-850">Document Registry</h3>
                <p className="text-[11px] text-slate-450 mt-0.5">These files are embedded in your ID card's QR code.</p>
              </div>
              <span className="badge-blue text-[10px] px-2.5 py-1 font-bold">
                {documents.length} Total Linked Files
              </span>
            </div>

            {/* Document upload form (for cardholder) */}
            <form onSubmit={handleDocUpload} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 space-y-3 no-print">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-indigo-650" />
                Upload & Link New Personal Document
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-6">
                  <label className="form-label text-[10px] text-slate-500">Document Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Intermediate Certificate"
                    className="form-input text-xs py-1.5"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="form-label text-[10px] text-slate-500">Select File * (PDF or Image)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="form-input text-xs py-1"
                    ref={fileInputRef}
                    onChange={e => setUploadFile(e.target.files[0])}
                    required
                  />
                </div>
              </div>
              
              {uploadSuccess && (
                <div className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {uploadSuccess}
                </div>
              )}
              {uploadError && (
                <div className="text-red-650 font-bold text-[10px] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {uploadError}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button 
                  type="submit" 
                  disabled={uploadingDoc || !uploadFile}
                  className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  {uploadingDoc ? 'Uploading...' : 'Link to QR Code'}
                </button>
              </div>
            </form>

            {/* Document display list */}
            {documents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <FileText className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Your QR card document registry is empty.</p>
                <p className="text-[10px] text-slate-400">Upload your documents or wait for the university to issue credentials.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* University Issued Section */}
                {universityIssuedDocs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-650 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      University Issued Documents
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {universityIssuedDocs.map(doc => (
                        <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-200 hover:border-emerald-200 rounded-xl bg-slate-50/30 transition-all card-hover">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">{doc.title}</p>
                              <span className="text-[9px] text-slate-400 uppercase font-semibold">Official Credential</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`${apiBase.replace('/api', '')}${doc.fileUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-500"
                              title="Download File"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-uploaded docs section */}
                {selfUploadedDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Your Uploaded Documents
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selfUploadedDocs.map(doc => (
                        <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-200 hover:border-indigo-200 rounded-xl bg-slate-50/30 transition-all card-hover">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">{doc.title}</p>
                              <span className="text-[9px] text-slate-400 font-semibold uppercase">Personal Upload</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <a 
                              href={`${apiBase.replace('/api', '')}${doc.fileUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-500"
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button 
                              onClick={() => handleDeleteDoc(doc._id)}
                              className="h-8 w-8 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors text-red-500"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* QR DECODE SUCCESS MODAL */}
      {showQrModal && qrDecodedData && (
        <div className="modal-overlay z-50" onClick={() => setShowQrModal(false)}>
          <div className="modal-box max-w-xl border border-indigo-100 bg-white text-slate-800" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-indigo-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base leading-tight">Decoded Credentials Verified</h3>
                  <p className="text-[10px] text-indigo-200 mt-0.5">Secure verification from university registry</p>
                </div>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Identity summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-14 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-350 flex items-center justify-center font-bold text-slate-500 uppercase text-sm">
                  {qrDecodedData.card.profilePicture ? (
                    <img 
                      src={`${apiBase.replace('/api', '')}${qrDecodedData.card.profilePicture}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    qrDecodedData.card.name?.slice(0, 2)
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-indigo-950">{qrDecodedData.card.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 font-bold">{qrDecodedData.card.rollNo}</p>
                  <p className="text-[10px] text-slate-500 leading-tight font-semibold">
                    {qrDecodedData.card.role === 'student' ? 'Student' : 'Faculty Member'} · {qrDecodedData.card.department || 'Software Engineering'} Department
                  </p>
                </div>
              </div>

              {/* Document list inside modal */}
              <div className="space-y-2">
                <h4 className="text-[10.5px] font-extrabold text-indigo-900 uppercase tracking-wider pl-0.5">
                  Linked Verification Files ({qrDecodedData.documents.length})
                </h4>

                {qrDecodedData.documents.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">This card does not have any linked documents.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {qrDecodedData.documents.map(doc => (
                      <div 
                        key={doc._id} 
                        className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck className={`h-4.5 w-4.5 ${doc.uploadedByRole === 'university' ? 'text-emerald-500' : 'text-indigo-500'}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{doc.title}</p>
                            <span className="text-[8.5px] text-slate-450 uppercase font-semibold">
                              {doc.uploadedByRole === 'university' ? 'Official Copy' : 'User Upload'}
                            </span>
                          </div>
                        </div>
                        <a 
                          href={`${apiBase.replace('/api', '')}${doc.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-8 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-[10px] flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setShowQrModal(false)}
                className="btn-secondary py-1.5 px-4 text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCard;
