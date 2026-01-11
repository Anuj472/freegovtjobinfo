import React from 'react';
import { Job } from '../types';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  const shareUrl = window.location.href;
  const shareText = `Check out this job opportunity: ${job.title}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-8 right-8 text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold uppercase transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>
        
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {job.isLatest && <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Latest Alert</span>}
            <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{job.category[0]}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-100 text-sm font-medium">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {job.organization}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Apply By: {new Date(job.lastDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div 
              className="prose prose-blue max-w-none" 
              dangerouslySetInnerHTML={{ __html: job.content }} 
            />
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
                Share This Job
              </h4>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleShareWhatsApp}
                  className="w-full bg-[#25D366] text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-sm font-bold uppercase text-xs"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67-.148-.197 0-.744.049-1.14.223-.396.174-.769.447-.961.644-.192.197-.391.222-.688.073-.297-.148-1.258-.464-2.396-1.48-.884-.787-1.48-1.759-1.653-2.056-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
                <button 
                  onClick={handleShareTelegram}
                  className="w-full bg-[#0088cc] text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0077b5] transition-colors shadow-sm font-bold uppercase text-xs"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56l.4-5.63 10.25-9.27c.45-.4-.1-.6-.7-.2L6.32 12.5l-5.45-1.7c-1.2-.37-1.2-1.2.25-1.77l21.31-8.21c1-.37 1.86.23 1.48 1.97z"/>
                  </svg>
                  Telegram
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Details</h4>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Posted</span>
                  <span className="text-gray-800">{new Date(job.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Qualification</span>
                  <span className="text-gray-800 text-right">{job.qualification.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Region</span>
                  <span className="text-gray-800 text-right uppercase text-[10px]">{job.state.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;