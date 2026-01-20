import React from 'react';
import { Job } from '../types';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  const shareUrl = window.location.href;
  const shareText = `Govt Job Opportunity: ${job.title}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visible Breadcrumbs */}
      <nav className="bg-gray-50 px-6 py-3 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors">Home</button>
        <span>/</span>
        <span className="text-blue-600">{job.category[0] || 'Jobs'}</span>
        <span>/</span>
        <span className="truncate">{job.organization}</span>
      </nav>

      <div className="bg-gradient-to-r from-blue-800 to-blue-950 p-6 md:p-10 text-white relative">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">Official Alert 2025-26</span>
            <span className="bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified Recruitment
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black mb-6 leading-tight tracking-tight uppercase">{job.title}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-100 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/5">
              <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Last Date: {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/5">
              <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Updated: {new Date(job.updatedDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-10 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">Detailed Recruitment Summary</h3>
                </div>
                <div className="grid grid-cols-2 bg-white divide-x divide-y divide-gray-100">
                    <div className="p-5"><span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Organization</span><span className="text-sm font-bold text-blue-900">{job.organization}</span></div>
                    <div className="p-5"><span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Designation</span><span className="text-sm font-bold text-blue-900">{job.jobRole}</span></div>
                    <div className="p-5"><span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Eligibility</span><span className="text-sm font-bold text-blue-900">{job.qualification.join(', ')}</span></div>
                    <div className="p-5"><span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">State/Location</span><span className="text-sm font-bold text-blue-900 uppercase">{job.state.join(', ')}</span></div>
                </div>
            </div>

            <div 
              className="prose prose-blue prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: job.content }} 
            />

            {/* Editorial attribution desk (E-E-A-T) */}
            <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-xl relative overflow-hidden">
                <div className="absolute -top-6 -right-6 text-blue-100">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Official Verification Desk</h4>
                <p className="text-xs text-blue-800 leading-loose font-medium">
                  Our editorial researchers have cross-referenced this notification with the **Employment News** and the official **{job.organization}** portal. We manually verify all application links to prevent data phishing. Always verify the source PDF before making any payment.
                </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-black text-gray-800 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Share Verified Alert
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={handleShareWhatsApp} className="w-full bg-[#25D366] text-white p-4 rounded-lg flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-colors shadow-sm font-black uppercase text-[10px] tracking-widest">WhatsApp</button>
                <button onClick={handleShareTelegram} className="w-full bg-[#0088cc] text-white p-4 rounded-lg flex items-center justify-center gap-3 hover:bg-[#0077b5] transition-colors shadow-sm font-black uppercase text-[10px] tracking-widest">Telegram</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;