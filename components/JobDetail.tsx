
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
            
            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-blue-900 mb-1">Apply for this post</h4>
                <p className="text-blue-700 text-sm font-medium">Verify all details in the official notification.</p>
              </div>
              <a 
                href={job.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white font-black px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3 uppercase tracking-wider text-sm"
              >
                Open Official Link
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
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
                  className="w-full bg-green-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm font-bold uppercase text-xs"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.171c1.589.945 3.554 1.443 5.548 1.444 5.405 0 9.803-4.398 9.805-9.804.001-2.618-1.02-5.08-2.875-6.934s-4.316-2.876-6.933-2.877c-5.403 0-9.803 4.398-9.805 9.804-.001 1.83.479 3.623 1.391 5.234l-1.013 3.705 3.815-.999zm11.387-5.4c.074-.124.272-.198.57-.347.297-.149 1.758-.868 2.031-.967.272-.099.471-.148.67-.148.199 0 .744.05 1.14.223s.67.297.769.446c.099.149.099.842-.223 1.189-.322.347-1.115 1.09-1.586 1.339-.471.248-.916.322-1.56.025-.644-.297-2.723-1.003-5.188-3.203-1.918-1.712-3.213-3.827-3.585-4.471-.371-.644-.039-.993.258-1.289.268-.267.59-.693.892-1.04.3-.347.397-.594.595-.99.198-.396.099-.743-.05-1.04-.148-.297-1.337-3.218-1.833-4.407-.483-1.166-.974-1.008-1.337-1.026-.347-.017-.743-.021-1.14-.021s-1.04.149-1.585.743c-.545.594-2.081 2.031-2.081 4.954 0 2.922 2.13 5.746 2.427 6.142.297.396 4.192 6.399 10.158 8.977.121.052.239.102.355.15.654.204 1.249.175 1.719.105.524-.078 1.61-.658 1.838-1.293.228-.635.228-1.181.16-1.293z"/></svg>
                  WhatsApp
                </button>
                <button 
                  onClick={handleShareTelegram}
                  className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm font-bold uppercase text-xs"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.891 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.331-.373-.121l-6.871 4.326-2.962-.924c-.643-.201-.657-.643.134-.952l11.57-4.458c.537-.196 1.006.128.832.93z"/></svg>
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
