/**
 * ============================================
 * FAQ ACCORDION COMPONENT
 * ============================================
 * Accordion component untuk menampilkan FAQ
 * dengan expand/collapse functionality
 * 
 * @component FAQAccordion
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQAccordion = ({ faqs, category = 'all' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  // Filter FAQs by category if specified
  const filteredFAQs = category === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === category);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!filteredFAQs || filteredFAQs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-body text-gray-500">Belum ada FAQ untuk kategori ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredFAQs.map((faq, index) => (
        <div 
          key={faq.id} 
          className="card overflow-hidden hover:shadow-md transition-all duration-200"
        >
          {/* Question Header */}
          <button
            onClick={() => toggleFAQ(index)}
            className="btn-touch w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 text-left"
          >
            <span className="font-medium text-gray-900 pr-4 text-sm md:text-base">
              {faq.question}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </button>

          {/* Answer Body */}
          {openIndex === index && (
            <div className="p-4 bg-green-50 border-t border-green-100 animate-scale-in">
              <p className="text-body text-gray-700 whitespace-pre-wrap">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
