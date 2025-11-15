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
 */

import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO, getWhatsAppURL, getEmailLink, getDirectionURL } from '../../utils/contactConfig';

const ContactInfoCard = ({ title, icon: IconComponent, info, actionButton }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Icon & Title */}
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-3 rounded-full">
          <IconComponent className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="ml-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      {/* Info Content */}
      <div className="text-gray-600 mb-4 space-y-1">
        {Array.isArray(info) ? (
          info.map((item, index) => (
            <p key={index}>{item}</p>
          ))
        ) : (
          <p>{info}</p>
        )}
      </div>

      {/* Action Button */}
      {actionButton && (
        <div>
          {actionButton}
        </div>
      )}
    </div>
  );
};

const ContactInfoCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* WhatsApp Card */}
      <ContactInfoCard
        title="WhatsApp Customer Service"
        icon={Phone}
        info={[
          `+${CONTACT_INFO.whatsapp}`,
          'Chat langsung dengan tim kami'
        ]}
        actionButton={
          <a
            href={getWhatsAppURL('Halo, saya ingin bertanya tentang produk BaleTani')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
        info={[
          CONTACT_INFO.email,
          'Kami akan membalas dalam 24 jam'
        ]}
        actionButton={
          <a
            href={getEmailLink('Pertanyaan dari Website', '')}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Lihat Peta
          </a>
        }
      />

      {/* Operational Hours Card */}
      <ContactInfoCard
        title="Jam Operasional"
        icon={Clock}
        info={[
          'Senin - Jumat: 08.00 - 21.00',
          'Sabtu: 08.00 - 22.00',
          'Minggu: 09.00 - 20.00'
        ]}
        actionButton={
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Buka Sekarang
            </span>
          </div>
        }
      />
    </div>
  );
};

export default ContactInfoCards;