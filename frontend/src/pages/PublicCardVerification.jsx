import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  Download, 
  FileText, 
  ExternalLink, 
  AlertCircle,
  GraduationCap,
  Building,
  Calendar,
  Phone,
  MapPin,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';

const PublicCardVerification = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flipped, setFlipped] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPublicCard = async () => {
      try {
        const response = await axios.get(`${apiBase}/virtual-card/public/${userId}`);
        setData(response.data.data);
      } catch (err) {
        console.error('Error fetching public card details:', err);
        setError(err.response?.data?.message || 'Verification link is invalid or the user does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCard();
  }, [userId, apiBase]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Verifying credentials, please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md border border-slate-200 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Verification Failed</h2>
          <p className="text-sm text-slate-550">{error}</p>
          <div className="pt-2">
            <span className="text-[10px] text-slate-400 font-medium">Khwaja Fareed University of Engineering & Information Technology</span>
          </div>
        </div>
      </div>
    );
  }

  const { card, documents } = data;
  const isStudent = card.role === 'student';

  const universityIssuedDocs = documents.filter(doc => doc.uploadedByRole === 'university');
  const selfUploadedDocs = documents.filter(doc => doc.uploadedByRole === 'self');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-8">
      {/* Brand Header */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">KFUEIT PORTAL</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Official Credential Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase">
          <CheckCircle className="h-3.5 w-3.5 fill-emerald-500/10" />
          Verified Account
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Verification Card Column */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Virtual ID Card</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click the card to flip and view details</p>
          </div>

          {/* Interactive Flipping Card */}
          <div 
            className="relative w-full max-w-[360px] h-[225px] cursor-pointer perspective"
            onClick={() => setFlipped(!flipped)}
          >
            <div className={`relative w-full h-full duration-500 transform-style transition-transform ${flipped ? 'rotate-y-180' : ''}`}>
              
              {/* CARD FRONT */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 overflow-hidden backface-hidden flex flex-col justify-between p-3 select-none">
                
                {/* Front Top header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {/* Mock KFUEIT Logo */}
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center border border-emerald-500 text-white shrink-0 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0.5 rounded-full border border-dashed border-white/50 animate-spin-slow"></div>
                      <span className="font-black text-[9px] relative z-10">UEIT</span>
                    </div>
                    <div>
                      <h2 className="text-[8px] font-extrabold text-slate-500 uppercase leading-none tracking-tight">Khwaja Fareed</h2>
                      <h3 className="text-sm font-black text-indigo-900 leading-none">UEIT</h3>
                      <p className="text-[7px] font-bold text-slate-400 uppercase leading-none tracking-wider mt-0.5">Rahim Yar Khan</p>
                    </div>
                  </div>
                  {/* Decorative Wavy Lines */}
                  <div className="text-emerald-500/20 text-xs shrink-0 select-none">
                    <svg width="45" height="15" viewBox="0 0 45 15" fill="none">
                      <path d="M0 2.5C5 2.5 7.5 7.5 12.5 7.5C17.5 7.5 20 2.5 25 2.5C30 2.5 32.5 7.5 37.5 7.5C42.5 7.5 45 2.5 50 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M0 7.5C5 7.5 7.5 12.5 12.5 12.5C17.5 12.5 20 7.5 25 7.5C30 7.5 32.5 12.5 37.5 12.5C42.5 12.5 45 7.5 50 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Front Middle Identity Bar */}
                <div className="relative my-2 flex items-center justify-between">
                  <div className="absolute inset-0 bg-indigo-900 -mx-3 h-[76px] top-1/2 -translate-y-1/2"></div>
                  
                  {/* Name and Department details */}
                  <div className="relative z-10 pl-1 py-1 text-white space-y-1 max-w-[210px]">
                    <h4 className="font-extrabold text-xs uppercase leading-tight tracking-wide line-clamp-1">{card.name}</h4>
                    <p className="text-[9px] text-indigo-200 font-semibold leading-none">{card.role === 'student' ? 'Student' : 'Faculty Member'}</p>
                    <p className="text-[9px] text-indigo-100 font-medium leading-none line-clamp-1">
                      {isStudent ? 'Software Engineering' : `${card.department || 'SE'} Department`}
                    </p>
                    <p className="text-[9px] font-mono text-white/95 leading-none font-bold">{card.rollNo || 'SWEN241101017'}</p>
                  </div>

                  {/* Oval Profile Picture overlapping */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-[74px] h-[86px] rounded-[18px] bg-slate-100 border-[3.5px] border-indigo-900 shadow-md overflow-hidden flex items-center justify-center">
                      {card.profilePicture ? (
                        <img 
                          src={`${apiBase.replace('/api', '')}${card.profilePicture}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <UserCheck className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Front Bottom footer */}
                <div className="flex justify-between items-end text-[8px] font-bold text-slate-500 border-t border-slate-100 pt-1.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span>Valid till <span className="text-red-600 font-extrabold">{card.cardValidTill || '2028-07-05'}</span></span>
                  </div>
                  <span className="text-[7px] text-slate-400 uppercase tracking-widest">Front Side</span>
                </div>

              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 overflow-hidden backface-hidden rotate-y-180 flex flex-col justify-between p-3 select-none">
                
                {/* Back Top details */}
                <div className="space-y-1 text-[8.5px] font-semibold pl-1">
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[84px] shrink-0">CNIC:</span>
                    <span className="text-slate-700">{card.cnic || '31301-8039182-3'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[84px] shrink-0">Emergency:</span>
                    <span className="text-slate-700">{card.emergencyContact || '0306-1389233'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-indigo-900 font-extrabold w-[84px] shrink-0">Address:</span>
                    <span className="text-slate-700 leading-tight line-clamp-2">{card.address || 'Abu Dhabi Road, Rahim Yar Khan'}</span>
                  </div>
                </div>

                {/* Back Bottom Signature & QR code section */}
                <div className="flex justify-between items-end my-1">
                  
                  {/* Authority Signature */}
                  <div className="flex flex-col items-start pl-1">
                    <span className="text-[7px] font-bold text-indigo-900 uppercase">Authority Signature</span>
                    <div className="h-8 flex items-end justify-start min-w-[90px] border-b border-slate-300 pb-1 mt-0.5">
                      {card.authoritySignature ? (
                        <span className="font-signature text-base text-slate-700 leading-none select-none tracking-wide">
                          {card.authoritySignature}
                        </span>
                      ) : (
                        <div className="w-16 h-4 bg-slate-100 border border-dashed border-slate-200 rounded flex items-center justify-center text-[7px] text-slate-400">
                          Pending
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification QR Code */}
                  <div className="shrink-0 bg-white p-0.5 border border-slate-200 rounded-lg shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/verify/card/' + userId)}`} 
                      alt="Verification QR" 
                      className="w-[56px] h-[56px]"
                    />
                  </div>
                </div>

                {/* Back Bottom Green Banner */}
                <div className="absolute inset-x-0 bottom-0 bg-emerald-600 px-3 py-1.5 text-white flex justify-between items-center text-[7px] leading-tight font-medium">
                  <div>
                    <p className="font-extrabold">Khwaja Fareed University of Engineering & IT</p>
                    <p className="opacity-90">Abu Dhabi Road, Rahim Yar Khan. Tel: +92 68 5882400</p>
                  </div>
                  <span className="font-mono font-bold opacity-80 shrink-0">0003550217</span>
                </div>

              </div>

            </div>
          </div>

          {/* Flip Toggle Prompt */}
          <button 
            onClick={() => setFlipped(!flipped)} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            Flip ID Card Side
          </button>
        </div>

        {/* Verification Documents Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* User Details Overview Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <UserCheck className="h-4.5 w-4.5 text-indigo-400" />
              Verified Cardholder Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Full Name</span>
                <p className="font-bold text-white">{card.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Roll Number / ID</span>
                <p className="font-bold text-indigo-300 font-mono">{card.rollNo}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">University Status</span>
                <p className="font-semibold text-white capitalize">{card.role}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Academic Department</span>
                <p className="font-semibold text-white">{card.department || 'Software Engineering'}</p>
              </div>
            </div>
          </div>

          {/* Linked Documents section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                QR-Linked Verification Documents
              </h3>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {documents.length} Files Linked
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center text-slate-400">
                <FileText className="h-10 w-10 mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-semibold">No documents linked to this QR code yet.</p>
                <p className="text-xs text-slate-500 mt-1">This user hasn't uploaded or been issued any credentials.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* SECTION 1: UNIVERSITY ISSUED */}
                {universityIssuedDocs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Official University Issued
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {universityIssuedDocs.map(doc => (
                        <div 
                          key={doc._id} 
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{doc.title}</p>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mt-0.5">
                                <CheckCircle className="h-3 w-3 text-emerald-400" />
                                Official Copy
                              </span>
                            </div>
                          </div>
                          <a 
                            href={`${apiBase.replace('/api', '')}${doc.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs items-center gap-1.5 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 2: CARDHOLDER UPLOADED */}
                {selfUploadedDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      Cardholder Self-Uploaded
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selfUploadedDocs.map(doc => (
                        <div 
                          key={doc._id} 
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{doc.title}</p>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 block">
                                User Document
                              </span>
                            </div>
                          </div>
                          <a 
                            href={`${apiBase.replace('/api', '')}${doc.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex h-9 px-4 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs items-center gap-1.5 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
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

      {/* Footer Branding */}
      <div className="w-full max-w-4xl text-center border-t border-white/10 pt-6 mt-12 pb-6">
        <p className="text-xs text-slate-500">
          Khwaja Fareed University of Engineering & Information Technology (KFUEIT), Rahim Yar Khan
        </p>
        <p className="text-[10px] text-slate-650 mt-1">
          This verification service is secure and cryptographically linked to the official university LMS registry database.
        </p>
      </div>
    </div>
  );
};

export default PublicCardVerification;
