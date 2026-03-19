import React from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import { IoClose, IoDownloadOutline } from 'react-icons/io5';
import { useAuth } from '../Contexts/AuthContext';
import { BASE_URL } from '../Services/baseUrl';

const MediaModal = ({ isOpen, onClose, mediaUrl, mediaType, mediaName }) => {
    const { accessToken, adminAccessToken } = useAuth();
    const token = accessToken || adminAccessToken;

    if (!isOpen || !mediaUrl) return null;

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            // Priority 1: Try Backend Proxy Download (Bypasses CORS, Forces Download)
            // We use the proxy which will serve the file with Content-Disposition: attachment
            const proxyDownloadUrl = `${BASE_URL}/api/chat/download?fileUrl=${encodeURIComponent(mediaUrl)}`;
            
            const response = await fetch(proxyDownloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Proxy download failed');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            
            const urlFileName = mediaUrl.split('/').pop().split('?')[0];
            const finalFileName = mediaName || urlFileName || (mediaType === 'pdf' ? 'document.pdf' : 'image.jpg');
            
            link.setAttribute('download', finalFileName);
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            
        } catch (err) {
            console.error("Direct download failed, trying fallback:", err);
            
            // Priority 2: Fallback to Manual Download (If Proxy/CORS fails)
            window.open(mediaUrl, '_blank');
            
            Swal.fire({
                title: 'Download Assistance',
                text: 'Direct download was restricted by the storage server. The file was opened in a new tab; please use the download icon there or Right-Click > Save As.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#000',
                cancelButtonColor: '#666',
                confirmButtonText: 'I Understand',
                cancelButtonText: 'Copy Link'
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    navigator.clipboard.writeText(mediaUrl);
                    Swal.fire({
                        title: 'Copied!',
                        text: 'Link copied to clipboard.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="absolute -top-12 left-0 right-0 flex justify-between items-center text-white px-2">
                    <h3 className="text-sm font-medium truncate max-w-[70%]">{mediaName || 'Media Preview'}</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleDownload}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm"
                            title="Download"
                        >
                            <IoDownloadOutline className="w-5 h-5" />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Close"
                        >
                            <IoClose className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Media Content */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white/5">
                    {mediaType === 'image' ? (
                        <img 
                            src={mediaUrl} 
                            alt={mediaName} 
                            className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                        />
                    ) : (
                        <iframe 
                            src={`${mediaUrl}#toolbar=0`}
                            className="w-full h-[80vh] bg-white rounded-lg"
                            title="PDF Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default MediaModal;
