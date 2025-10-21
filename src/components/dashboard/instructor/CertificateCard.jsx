import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const CertificateCard = ({ certificate, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-[var(--gray-100)] overflow-hidden">
      <div className="p-4">
        <img 
          src={certificate.imageSrc} 
          alt={certificate.name}
          className="w-full h-auto rounded-lg"
        />
      </div>
      
      <div className="px-4 pb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {certificate.title}
        </h3>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onView(certificate)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="View certificate"
          >
            <Eye className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
          
          <button 
            onClick={() => onEdit(certificate)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Edit certificate"
          >
            <Edit className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
          
          <button 
            onClick={() => onDelete(certificate)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Delete certificate"
          >
            <Trash2 className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard