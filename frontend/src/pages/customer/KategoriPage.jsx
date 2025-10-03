import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  ChevronRight,
  Fish,
  Drumstick,
  Egg,
  Sprout,
  Leaf,
  Apple,
  Nut,
  Carrot,
  Droplet,
  Sparkles,
  Truck,
  Store,
} from 'lucide-react';
import Button from '../../components/ui/Button';

const CATEGORY_DATA = [
  {
    id: 1,
    name: 'Seafood',
    slug: 'seafood',
    description: 'Ikan dan hasil laut segar langsung dari petani tambak mitra BaleTani.',
    productCount: 9,
    sampleProducts: ['Udang sedang 1', 'Udang sedang 2', 'Udang besar'],
    tags: ['Kirim dingin', 'Restoran & UMKM', 'Panen harian'],
    type: 'protein',
    icon: Fish,
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    id: 2,
    name: 'Daging & Unggas',
    slug: 'daging-unggas',
    description: 'Daging sapi, ayam, dan olahan unggas pilihan untuk kebutuhan dapur Anda.',
    productCount: 5,
    sampleProducts: ['Ayam filet', 'Ceker Ayam', 'Sayap Ayam'],
    tags: ['Potong harian', 'Tanpa bahan kimia', 'Siap catering'],
    type: 'protein',
    icon: Drumstick,
    accent: 'bg-rose-50 text-rose-600',
  },
  {
    id: 3,
    name: 'Telur',
    slug: 'telur',
    description: 'Telur ayam dan telur puyuh dengan kualitas terbaik dan harga stabil.',
    productCount: 3,
    sampleProducts: ['Telor puyuh', 'Telur Ayam Kampung', 'Telur Ayam Ras'],
    tags: ['Supply harian', 'Grade A', 'Higienis'],
    type: 'protein',
    icon: Egg,
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    id: 4,
    name: 'Rempah & Bumbu',
    slug: 'rempah-bumbu',
    description: 'Rempah dan bumbu dapur pilihan untuk menjaga citarasa menu tradisional.',
    productCount: 9,
    sampleProducts: ['Sereh', 'Jahe', 'Cikur'],
    tags: ['Panen lokal', 'Pengiriman cepat', 'Kualitas premium'],
    type: 'essentials',
    icon: Sprout,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 5,
    name: 'Sayuran',
    slug: 'sayuran',
    description: 'Sayur organik dan hidroponik dengan kualitas hotel & restoran.',
    productCount: 8,
    sampleProducts: ['Tomat', 'Kentang', 'Suraung'],
    tags: ['Panen pagi', 'Dingin terjaga', 'Supply harian'],
    type: 'produce',
    icon: Leaf,
    accent: 'bg-lime-50 text-lime-600',
  },
  {
    id: 6,
    name: 'Buah-buahan',
    slug: 'buah',
    description: 'Buah lokal dan impor segar dengan kualitas grade A.',
    productCount: 9,
    sampleProducts: ['Pete', 'Apel', 'Lemon premium'],
    tags: ['Ready stok', 'Premium', 'Kualitas ekspor'],
    type: 'produce',
    icon: Apple,
    accent: 'bg-orange-50 text-orange-600',
  },
  {
    id: 7,
    name: 'Biji-bijian & Kacang',
    slug: 'biji-kacang',
    description: 'Biji-bijian dan kacang berkualitas untuk bahan baku usaha kuliner.',
    productCount: 5,
    sampleProducts: ['Jagung Manis', 'Jagung Pipilan', 'Kacang Hijau'],
    tags: ['Kemasan rapi', 'Tahan lama', 'Bulk order'],
    type: 'essentials',
    icon: Nut,
    accent: 'bg-yellow-50 text-yellow-600',
  },
  {
    id: 8,
    name: 'Umbi-umbian',
    slug: 'umbi',
    description: 'Umbi segar dari petani lokal dengan suplai terjaga sepanjang tahun.',
    productCount: 1,
    sampleProducts: ['Ketela Pohon'],
    tags: ['Langsung petani', 'Stok stabil', 'Bisa grosir'],
    type: 'produce',
    icon: Carrot,
    accent: 'bg-orange-100 text-orange-600',
  },
  {
    id: 9,
    name: 'Minyak & Bahan Masak',
    slug: 'minyak-bahan',
    description: 'Minyak goreng, tepung, dan bahan masak penting untuk dapur Anda.',
    productCount: 3,
    sampleProducts: ['Minyak Goreng (Curah)', 'Minyak Goreng (Kemasan)', 'Tepung Terigu Cakra Kembar'],
    tags: ['Harga grosir', 'Stok terjaga', 'Kemasan aman'],
    type: 'essentials',
    icon: Droplet,
    accent: 'bg-cyan-50 text-cyan-600',
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Semua', icon: Sparkles },
  { id: 'produce', label: 'Sayur & Buah', icon: Leaf },
  { id: 'protein', label: 'Protein Segar', icon: Drumstick },
  { id: 'essentials', label: 'Bahan Pokok', icon: Store },
];

const TOTAL_PRODUCT_COUNT = CATEGORY_DATA.reduce((total, category) => total + category.productCount, 0);

const HighlightStat = ({ icon: Icon, value, label, description }) => (
  <div className="card card-hover p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-gray-500">{description}</p>
  </div>
);

const FilterPill = ({ label, icon: Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
      active ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
    }`}
  >
    {Icon && <Icon size={16} />}
    {label}
  </button>
);

const CategoryCard = ({ category, isActive, onSelect }) => {
  const { icon: Icon } = category;

  return (
    <div
      className={`card card-hover flex h-full flex-col justify-between p-6 transition-all ${
        isActive ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-50' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.accent}`}>
            <Icon size={24} />
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600'}`}>
            {category.productCount} SKU aktif
          </span>
        </div>
        <h3 className={`mt-4 text-lg font-semibold ${isActive ? 'text-primary-600' : 'text-gray-900'}`}>{category.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{category.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {category.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect(category)}
          className={`inline-flex items-center text-sm font-semibold transition ${
            isActive ? 'text-primary-600' : 'text-primary-500 hover:text-primary-600'
          }`}
        >
          Lihat detail
          <ChevronRight size={16} className="ml-1" />
        </button>
        <Link to={`/products?category=${category.slug}`} className="inline-flex">
          <Button variant={isActive ? 'primary' : 'outline'} size="sm">
            Lihat produk
          </Button>
        </Link>
      </div>
    </div>
  );
};

const CategoryInsightPanel = ({ category, onSavePreference }) => {
  if (!category) {
    return (
      <div className="card p-6">
        <p className="text-sm text-gray-500">Pilih kategori untuk melihat highlight dan rekomendasi produk.</p>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.accent}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.productCount} produk siap kirim</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">{category.description}</p>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contoh produk</p>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          {category.sampleProducts.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
        Mencari pesanan rutin? Tandai kategori ini agar tim sales kami dapat menyiapkan penawaran spesial.
      </div>

      <Button
        className="mt-5 w-full"
        onClick={() => onSavePreference(category)}
        variant="primary"
      >
        Simpan kategori favorit
      </Button>
    </div>
  );
};

const KategoriPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_DATA[0] ?? null);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return CATEGORY_DATA.filter((category) => {
      const matchesFilter = activeFilter === 'all' || category.type === activeFilter;
      const matchesSearch =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [searchTerm, activeFilter]);

  const visibleSelection = useMemo(() => {
    if (!filteredCategories.length) {
      return null;
    }

    if (!selectedCategory) {
      return filteredCategories[0];
    }

    return filteredCategories.find((category) => category.id === selectedCategory.id) || filteredCategories[0];
  }, [filteredCategories, selectedCategory]);

  const activeCategoryId = selectedCategory ? selectedCategory.id : visibleSelection?.id;

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleSavePreference = (category) => {
    toast.success(`${category.name} ditandai sebagai kategori favorit Anda.`);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setSelectedCategory(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    const term = value.trim().toLowerCase();
    setSearchTerm(value);

    if (!term) {
      setSelectedCategory(null);
      return;
    }

    setSelectedCategory((prev) => {
      if (
        prev &&
        (prev.name.toLowerCase().includes(term) ||
          prev.tags.some((tag) => tag.toLowerCase().includes(term)))
      ) {
        return prev;
      }
      return null;
    });
  };

  const highlightStats = useMemo(
    () => [
      {
        icon: Store,
        value: CATEGORY_DATA.length,
        label: 'Total kategori',
        description: 'Seluruh kategori sinkron dengan database backend.',
      },
      {
        icon: Sparkles,
        value: TOTAL_PRODUCT_COUNT,
        label: 'SKU aktif',
        description: 'Produk yang siap diproses dan dikirim setiap hari.',
      },
      {
        icon: Truck,
        value: '< 24 jam',
        label: 'Lead time pengiriman',
        description: 'Pengiriman Bandung Raya dan sekitarnya dalam sehari.',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="container-custom py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold tracking-wide">
              Jelajahi Kategori BaleTani
            </span>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">Semua kebutuhan dapur dan usaha dalam satu platform</h1>
            <p className="mt-4 text-lg text-white/80">
              Temukan bahan baku terbaik dari petani mitra BaleTani. Data kategori dan produk kami mengikuti seeder backend sehingga mudah diintegrasikan dengan sistem Anda.
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gray-50" aria-hidden="true"></div>
      </section>

      <section className="relative -mt-16">
        <div className="container-custom grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-1/2">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Cari kategori atau tag..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map((filter) => (
                    <FilterPill
                      key={filter.id}
                      label={filter.label}
                      icon={filter.icon}
                      active={filter.id === activeFilter}
                      onClick={() => handleFilterChange(filter.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredCategories.map((category) => (
                <CategoryCard
                key={category.id}
                category={category}
                isActive={activeCategoryId === category.id}
                onSelect={handleSelectCategory}
              />
              ))}
              {filteredCategories.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                  <Filter size={32} className="mx-auto text-gray-300" />
                  <p className="mt-4 text-base font-semibold text-gray-700">Kategori tidak ditemukan</p>
                  <p className="mt-2 text-sm text-gray-500">Coba gunakan kata kunci lain atau reset filter yang sedang aktif.</p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => {
                      setActiveFilter('all');
                      setSearchTerm('');
                      setSelectedCategory(null);
                    }}
                  >
                    Reset filter
                  </Button>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {highlightStats.map((stat) => (
                <HighlightStat
                  key={stat.label}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  description={stat.description}
                />
              ))}
            </div>

            <CategoryInsightPanel category={visibleSelection} onSavePreference={handleSavePreference} />

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900">Perlu bantuan dari tim kami?</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tim sales BaleTani siap membantu menyusun paket bahan baku sesuai kategori favorit Anda.
              </p>
              <Button
                className="mt-4 w-full"
                variant="primary"
                onClick={() => toast.success('Tim sales kami akan segera menghubungi Anda melalui WhatsApp.')}
              >
                Hubungi sales
              </Button>
              <p className="mt-3 text-xs text-gray-400">Kami akan menghubungi Anda dalam 1 x 24 jam kerja.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default KategoriPage;
