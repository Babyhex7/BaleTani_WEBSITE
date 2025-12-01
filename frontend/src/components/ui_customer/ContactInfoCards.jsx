/**
 * ============================================
 * CONTACT INFO CARD COMPONENT
 * ============================================
 * Card component untuk menampilkan informasi kontak
 * WhatsApp, Email, Alamat, dengan action buttons
 * 
 * @component ContactInfoCard
 * @author BaleTani Development Team
 * @created 2025-11-15
 * @updated 2025-11-30 - Added realtime open/close status
 */

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO, getWhatsAppURL, getEmailLink, getDirectionURL, isCurrentlyOpen, getOperationalStatus } from '../../utils/contactConfig';

const ContactInfoCard = ({ title, icon: IconComponent, info, actionButton, bgColor = "bg-green-50", iconBg = "bg-green-100", iconColor = "text-green-600" }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className={`${iconBg} p-4 rounded-full shadow-sm`}>
          <IconComponent className={`w-8 h-8 ${iconColor}`} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center text-lg font-bold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Info Content */}
      <div className="text-center text-gray-600 mb-4 space-y-1 flex-grow">
        {Array.isArray(info) ? (
          info.map((item, index) => (
            <p key={index} className="text-sm leading-relaxed">{item}</p>
          ))
        ) : (
          <p className="text-sm leading-relaxed">{info}</p>
        )}
      </div>

      {/* Action Button */}
      {actionButton && (
        <div className="mt-auto">
          {actionButton}
        </div>
      )}
    </div>
  );
};

const ContactInfoCards = () => {
  // State untuk status buka/tutup (realtime)
  const [operationalStatus, setOperationalStatus] = useState(getOperationalStatus());

  // Update status setiap 1 menit
  useEffect(() => {
    const interval = setInterval(() => {
      setOperationalStatus(getOperationalStatus());
    }, 60000); // Update setiap 1 menit

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* WhatsApp Card */}
      <ContactInfoCard
        title="WhatsApp"
        icon={Phone}
        bgColor="bg-green-50"
        iconBg="bg-green-100"
        iconColor="text-green-600"
        info={[
          `+${CONTACT_INFO.whatsapp}`,
          'Chat langsung dengan tim kami'
        ]}
        actionButton={
          <a
            href={getWhatsAppURL('Halo, saya ingin bertanya tentang produk BaleTani')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Phone className="w-4 h-4 mr-2" />
            Kirim WhatsApp
          </a>
        }
      />

      {/* Email Card */}
      <ContactInfoCard
        title="Email Support"
        icon={Mail}
        bgColor="bg-blue-50"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        info={[
          CONTACT_INFO.email,
          'Kami akan membalas dalam 24 jam'
        ]}
        actionButton={
          <a
            href={getEmailLink('Pertanyaan dari Website', '')}
            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Mail className="w-4 h-4 mr-2" />
            Kirim Email
          </a>
        }
      />

      {/* Location Card */}
      <ContactInfoCard
        title="Kunjungi Toko"
        icon={MapPin}
        bgColor="bg-red-50"
        iconBg="bg-red-100"
        iconColor="text-red-600"
        info={[
          CONTACT_INFO.address.street,
          `${CONTACT_INFO.address.city}, ${CONTACT_INFO.address.province}`,
          CONTACT_INFO.address.postalCode
        ]}
        actionButton={
          <a
            href={getDirectionURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Lihat Peta
          </a>
        }
      />

      {/* Operational Hours Card - Realtime Status */}
      <ContactInfoCard
        title="Jam Operasional"
        icon={Clock}
        bgColor="bg-purple-50"
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        info={[
          'Senin - Jumat: 08.00 - 21.00',
          'Sabtu: 08.00 - 22.00',
          'Minggu: 09.00 - 20.00'
        ]}
        actionButton={
          <div className="text-center py-2">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
              operationalStatus.isOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                operationalStatus.isOpen ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              {operationalStatus.status} Sekarang
            </span>
            <p className="text-xs text-gray-500 mt-2">
              {operationalStatus.message}
            </p>
          </div>
        }
      />
    </div>
  );
};

export default ContactInfoCards;