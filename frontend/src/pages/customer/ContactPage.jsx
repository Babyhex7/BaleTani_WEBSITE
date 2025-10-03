import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactChannels = [
    {
      icon: Phone,
      title: 'Hubungi Kami',
      detail: '+62 812-3456-7890',
      description: 'Senin - Minggu, 08.00-20.00 WIB',
      href: 'tel:+6281234567890'
    },
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@baletani.id',
      description: 'Balasan dalam 1 x 24 jam',
      href: 'mailto:support@baletani.id'
    },
    {
      icon: MapPin,
      title: 'Alamat',
      detail: 'Jl. Pertanian Sejahtera No. 12, Bandung',
      description: 'Kunjungan Senin - Jumat, 09.00-17.00 WIB'
    }
  ];

  const quickSupport = [
    {
      icon: MessageCircle,
      title: 'WhatsApp CS',
      description: 'Respons cepat untuk pertanyaan pesanan.'
    },
    {
      icon: Clock,
      title: 'Waktu Operasional',
      description: 'Senin - Jumat 08.00-20.00 WIB, Sabtu 08.00-15.00 WIB.'
    }
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Lengkapi nama, email, dan pesan sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Pesan Anda sudah kami terima! Tim kami akan segera menghubungi.');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 800);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
      {/* gradient sebagai layer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 opacity-30" aria-hidden="true" />
        {/* konten */}
        <div className="container-custom relative z-10 py-10 md:py-28 pb-28 md:pb-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold tracking-wide">
              Hubungi BaleTani
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-tight">
              Kami Siap Membantu Kebutuhan Anda
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Apakah Anda memiliki pertanyaan seputar produk, kemitraan, atau butuh bantuan? Tim Customer Support BaleTani siap membantu kapan pun Anda butuh.
            </p>
          </div>
        </div>

        {/* strip putih bawah */}
        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 md:h-28 bg-white" aria-hidden="true" /> */}
      </section>

      <section className="relative -mt-16">
        <div className="container-custom grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {contactChannels.map(({ icon: Icon, title, detail, description, href }) => (
                <div key={title} className="card card-hover p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-50 text-primary-500">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-primary-500 font-medium text-base">{detail}</p>
                  <p className="mt-2 text-sm text-gray-500">{description}</p>
                  {href && (
                    <a href={href} className="mt-4 inline-flex items-center text-sm font-semibold text-primary-500 hover:text-primary-600">
                      Hubungi sekarang
                      <Send size={16} className="ml-2" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900">Kirim Pesan</h2>
              <p className="mt-2 text-sm text-gray-500">
                Sampaikan kebutuhan Anda melalui formulir berikut. Kami akan membalas dalam 1 x 24 jam kerja.
              </p>
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text"
                      placeholder="Masukkan nama Anda"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="nama@email.com"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="Contoh: 0812xxxx"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">Jenis Pesan</label>
                    <select
                      id="subject"
                      name="subject"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">Pilih salah satu</option>
                      <option value="produk">Pertanyaan Produk</option>
                      <option value="pesanan">Keluhan / Pesanan</option>
                      <option value="kemitraan">Kerja Sama / Kemitraan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">Pesan</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tulis pesan Anda di sini"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-sm text-gray-500">
                    Dengan mengirim pesan ini Anda menyetujui untuk dihubungi melalui email atau telepon.
                  </p>
                  <Button type="submit" variant="primary" loading={isSubmitting}>
                    <Send size={16} className="mr-2" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card p-8 bg-white/80 backdrop-blur">
              <h3 className="text-xl font-semibold text-gray-900">Kunjungi BaleTani</h3>
              <p className="mt-2 text-sm text-gray-500">
                Rasakan pengalaman memilih produk segar langsung di BaleTani Hub. Silakan buat janji terlebih dahulu agar tim kami bisa menyiapkan kebutuhan Anda.
              </p>
              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPin size={18} className="mt-1 text-primary-500" />
                  <span className="ml-3">Jl. Pertanian Sejahtera No. 12, Bandung</span>
                </div>
                <div className="flex items-start">
                  <Clock size={18} className="mt-1 text-primary-500" />
                  <span className="ml-3">Senin - Jumat 09.00-17.00 WIB</span>
                </div>
              </div>
              <Button className="mt-6 w-full" variant="outline">
                Atur Jadwal Kunjungan
              </Button>
            </div>

            <div className="card p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <h3 className="text-xl font-semibold">Butuh Jawaban Cepat?</h3>
              <p className="mt-2 text-white/80 text-sm">
                Tim WhatsApp kami siap membantu langsung terkait stok produk, status pesanan, atau konsultasi kebutuhan usaha Anda.
              </p>
              <Button className="mt-6 w-full bg-white text-primary-600 hover:bg-primary-50" variant="ghost">
                <MessageCircle size={16} className="mr-2" />
                Chat WhatsApp Sekarang
              </Button>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {quickSupport.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="bg-white/10 p-4 rounded-xl">
                    <Icon size={18} />
                    <p className="mt-2 text-sm font-semibold">{title}</p>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900">Ikuti Kabar Terbaru</h3>
              <p className="mt-2 text-sm text-gray-500">Dapatkan informasi promo, produk terbaru, dan tips bisnis kuliner dari BaleTani.</p>
              <form className="mt-4 flex gap-3">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <Button type="button" variant="primary">
                  Langganan
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
