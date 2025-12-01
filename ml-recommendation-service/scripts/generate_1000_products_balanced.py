"""
Generate 1000 Produk BALANCED untuk Training NCB v3
✅ BALANCED: Setiap kategori proporsional (tidak imbalance)
✅ MODULAR: Reusable functions
✅ SINKRON: Compatible dengan training pipeline existing
"""
import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# ============================================
# KONFIGURASI KATEGORI
# ============================================
CATEGORIES = {
    'Protein Laut': '660e8400-e29b-41d4-a716-446655440001',
    'Protein Daging': '660e8400-e29b-41d4-a716-446655440002',
    'Protein Telur': '660e8400-e29b-41d4-a716-446655440003',
    'Bumbu & Rempah': '660e8400-e29b-41d4-a716-446655440004',
    'Sayuran': '660e8400-e29b-41d4-a716-446655440005',
    'Buah': '660e8400-e29b-41d4-a716-446655440006',
    'Sembako': '660e8400-e29b-41d4-a716-446655440007'
}

# ============================================
# BALANCED DISTRIBUTION: 1000 produk → 7 kategori
# Target: ~143 produk per kategori (balanced!)
# ============================================
CATEGORY_TARGET_COUNTS = {
    'Protein Laut': 140,      # ~14%
    'Protein Daging': 145,    # ~14.5%
    'Protein Telur': 140,     # ~14%
    'Bumbu & Rempah': 145,    # ~14.5%
    'Sayuran': 145,           # ~14.5%
    'Buah': 140,              # ~14%
    'Sembako': 145            # ~14.5%
}
# Total = 1000 produk ✅

# ============================================
# BASE PRODUCTS TEMPLATE
# ============================================
BASE_PRODUCTS = {
    'Protein Laut': [
        ('Udang', ['kecil', 'sedang', 'besar', 'jumbo', 'vaname', 'windu', 'lobster kecil'], 
         [40000, 65000, 85000, 110000, 75000, 95000, 150000], 3, 'kg'),
        ('Cumi', ['kecil', 'sedang', 'besar', 'jumbo', 'segar', 'beku', 'cincang'], 
         [50000, 65000, 80000, 95000, 70000, 60000, 55000], 2, 'kg'),
        ('Ikan Kembung', ['segar', 'beku', 'asin', 'pindang', 'fillet'], 
         [30000, 25000, 35000, 32000, 40000], 2, 'kg'),
        ('Bawal', ['segar', 'fillet', 'putih', 'hitam'], 
         [35000, 45000, 40000, 38000], 2, 'kg'),
        ('Tongkol', ['utuh', 'fillet', 'segar', 'asap'], 
         [40000, 50000, 42000, 55000], 2, 'kg'),
        ('Cengek', ['segar', 'premium'], [75000, 85000], 2, 'kg'),
        ('Kakap', ['merah', 'putih', 'fillet merah', 'fillet putih'], 
         [90000, 85000, 100000, 95000], 2, 'kg'),
        ('Salmon', ['segar', 'fillet', 'steak', 'belly', 'head'], 
         [150000, 180000, 200000, 160000, 80000], 2, 'kg'),
        ('Kerang', ['hijau', 'darah', 'simping', 'kampak'], 
         [25000, 30000, 35000, 40000], 1, 'kg'),
        ('Kepiting', ['segar', 'bakau', 'rajungan'], 
         [120000, 110000, 100000], 2, 'kg'),
        ('Gurita', ['segar', 'beku'], [90000, 80000], 2, 'kg'),
        ('Sotong', ['segar', 'cincang'], [55000, 50000], 2, 'kg'),
        ('Teri', ['medan', 'nasi', 'kering'], [80000, 70000, 75000], 30, 'kg'),
    ],
    'Protein Daging': [
        ('Ayam filet', ['dada', 'paha', 'sayap', 'dada tanpa kulit', 'paha tanpa tulang'], 
         [43000, 38000, 35000, 45000, 42000], 3, 'kg'),
        ('Ceker Ayam', ['segar', 'beku', 'premium'], [15000, 13000, 17000], 5, 'kg'),
        ('Sayap Ayam', ['segar', 'bumbu', 'marinasi', 'mentega'], 
         [35000, 38000, 40000, 42000], 3, 'kg'),
        ('Ayam potong', ['all part', 'karkas', 'tanpa kepala', 'utuh'], 
         [35000, 33000, 34000, 37000], 3, 'kg'),
        ('Ayam', ['kampung', 'negeri', 'broiler', 'pejantan', 'organik'], 
         [45000, 27000, 28000, 40000, 55000], 3, 'ekor'),
        ('Daging Sapi', ['has dalam', 'has luar', 'paha', 'gandik', 'sampil', 'tetelan'], 
         [140000, 130000, 120000, 125000, 110000, 95000], 3, 'kg'),
        ('Daging Kambing', ['muda', 'dewasa', 'giling', 'tanpa lemak'], 
         [130000, 120000, 125000, 135000], 3, 'kg'),
        ('Iga Sapi', ['segar', 'potong', 'premium'], 
         [110000, 115000, 125000], 3, 'kg'),
        ('Daging Bebek', ['fillet', 'utuh'], [40000, 35000], 3, 'kg'),
        ('Hati Ayam', ['segar', 'premium'], [25000, 28000], 5, 'kg'),
        ('Ampela Ayam', ['segar'], [20000], 5, 'kg'),
        ('Bakso Daging', ['sapi', 'ayam', 'ikan'], [60000, 45000, 40000], 3, 'kg'),
    ],
    'Protein Telur': [
        ('Telur Ayam Kampung', ['organik', 'biasa', 'omega 3', 'premium', 'super'], 
         [4000, 3000, 3500, 4200, 4500], 14, 'pcs'),
        ('Telur Ayam Ras', ['omega 3', 'biasa', 'vitamin', 'premium', 'organik'], 
         [32000, 29000, 31000, 34000, 36000], 14, 'kg'),
        ('Telur Puyuh', ['segar', 'rebus', 'asin'], 
         [40000, 42000, 45000], 10, 'kg'),
        ('Telur Bebek', ['asin', 'segar', 'omega', 'premium'], 
         [35000, 30000, 33000, 38000], 14, 'kg'),
        ('Telur Angsa', ['segar'], [6000], 30, 'pcs'),
    ],
    'Bumbu & Rempah': [
        ('Sereh', ['segar', 'kering', 'bubuk'], [12000, 15000, 20000], 7, 'kg'),
        ('Jahe', ['merah', 'putih', 'emprit', 'bubuk merah', 'bubuk putih'], 
         [35000, 32000, 28000, 40000, 38000], 14, 'kg'),
        ('Cikur/Kencur', ['segar', 'bubuk'], [50000, 55000], 14, 'kg'),
        ('Lengkuas', ['segar', 'bubuk'], [20000, 25000], 14, 'kg'),
        ('Kunyit', ['segar', 'bubuk', 'putih'], [18000, 22000, 20000], 14, 'kg'),
        ('Tomat', ['merah', 'hijau', 'cherry', 'italia'], 
         [10000, 9000, 15000, 13000], 5, 'kg'),
        ('Daun Salam', ['segar', 'kering'], [500, 1000], 7, 'ikat'),
        ('Daun Jeruk', ['segar', 'kering'], [2000, 3000], 7, 'pak'),
        ('Bawang Putih', ['lokal', 'import', 'kating', 'kupas', 'bubuk'], 
         [40000, 35000, 42000, 45000, 50000], 30, 'kg'),
        ('Cabe Kriting', ['merah', 'hijau', 'merah keriting', 'rawit merah', 'rawit hijau'], 
         [72000, 65000, 70000, 80000, 75000], 7, 'kg'),
        ('Cabe Rawit', ['merah', 'hijau', 'super pedas', 'sedang'], 
         [80000, 75000, 85000, 78000], 7, 'kg'),
        ('Suraung/Bawang Daun', ['segar', 'hidroponik'], [15000, 18000], 5, 'ikat'),
        ('Sledri/Seledri', ['segar', 'hidroponik'], [20000, 23000], 5, 'kg'),
        ('Daun Bawang', ['segar', 'hidroponik', 'organik'], 
         [12000, 15000, 17000], 5, 'kg'),
        ('Bawang Merah', ['lokal', 'import', 'bima', 'nganjuk', 'brebes'], 
         [45000, 38000, 43000, 44000, 46000], 30, 'kg'),
        ('Kemiri', ['kupas', 'utuh'], [60000, 55000], 180, 'kg'),
        ('Lada', ['hitam', 'putih', 'hijau', 'bubuk hitam', 'bubuk putih'], 
         [120000, 110000, 130000, 125000, 115000], 360, 'kg'),
        ('Ketumbar', ['bubuk', 'biji', 'sangrai'], 
         [25000, 22000, 24000], 180, 'kg'),
        ('Jintan', ['biji', 'bubuk'], [35000, 38000], 180, 'kg'),
        ('Pala', ['utuh', 'bubuk'], [80000, 85000], 360, 'kg'),
        ('Cengkeh', ['kering', 'bubuk'], [150000, 160000], 360, 'kg'),
    ],
    'Sayuran': [
        ('Kentang', ['granola', 'lokal dieng', 'biasa', 'atlantik', 'merah'], 
         [20000, 17000, 18000, 19000, 21000], 14, 'kg'),
        ('Pete', ['segar', 'kupas', 'premium'], 
         [30000, 35000, 38000], 3, 'ikat'),
        ('Wortel', ['segar', 'organik', 'hidroponik', 'impor'], 
         [14000, 16000, 18000, 20000], 14, 'kg'),
        ('Jagung Manis', ['pipilan', 'tongkol', 'super sweet'], 
         [10000, 8000, 12000], 3, 'kg'),
        ('Jagung Pipilan', ['kering', 'basah'], [12000, 10000], 30, 'kg'),
        ('Ketela Pohon', ['segar', 'premium'], [5000, 6000], 7, 'kg'),
        ('Kol/Kubis', ['putih', 'ungu', 'mini', 'hidroponik'], 
         [7000, 9000, 11000, 13000], 7, 'kg'),
        ('Bayam', ['merah', 'hijau', 'hidroponik merah', 'hidroponik hijau'], 
         [8000, 7000, 10000, 9000], 2, 'kg'),
        ('Kangkung', ['air', 'darat', 'hidroponik', 'organik'], 
         [6000, 5000, 8000, 9000], 2, 'kg'),
        ('Terong', ['ungu', 'hijau', 'bulat', 'lalap'], 
         [7000, 6000, 8000, 7500], 5, 'kg'),
        ('Labu Siam', ['segar', 'premium'], [8000, 9000], 14, 'kg'),
        ('Buncis', ['segar', 'premium', 'hidroponik'], 
         [12000, 14000, 16000], 5, 'kg'),
        ('Kacang Panjang', ['segar', 'organik'], [10000, 12000], 5, 'kg'),
        ('Brokoli', ['segar', 'premium', 'organik'], 
         [20000, 23000, 25000], 5, 'kg'),
        ('Sawi', ['hijau', 'putih', 'pakcoy', 'caisim'], 
         [8000, 7000, 9000, 8500], 3, 'kg'),
        ('Kembang Kol', ['segar', 'premium'], [18000, 20000], 7, 'kg'),
        ('Timun', ['segar', 'jepang'], [6000, 8000], 7, 'kg'),
        ('Paprika', ['merah', 'kuning', 'hijau'], 
         [35000, 33000, 30000], 7, 'kg'),
    ],
    'Buah': [
        ('Apel', ['fuji', 'malang', 'washington', 'royal gala', 'green smith'], 
         [35000, 30000, 40000, 38000, 36000], 14, 'kg'),
        ('Lemon', ['premium import', 'lokal', 'cui', 'australia'], 
         [35000, 20000, 15000, 40000], 14, 'kg'),
        ('Salak', ['pondoh', 'bali', 'gading'], [12000, 10000, 13000], 7, 'kg'),
        ('Manggis', ['segar', 'premium'], [17000, 19000], 7, 'kg'),
        ('Nanas', ['madu', 'biasa', 'bogor', 'subang'], 
         [15000, 12000, 13000, 14000], 7, 'pcs'),
        ('Jeruk', ['sunkist', 'santang', 'baby', 'pontianak', 'medan'], 
         [30000, 24000, 20000, 26000, 28000], 14, 'kg'),
        ('Pisang', ['cavendish', 'raja', 'kepok', 'ambon', 'susu'], 
         [28000, 24000, 18000, 22000, 26000], 7, 'kg'),
        ('Mangga', ['harum manis', 'gedong', 'manalagi', 'arumanis', 'golek'], 
         [25000, 20000, 22000, 24000, 21000], 7, 'kg'),
        ('Pepaya', ['california', 'bangkok', 'lokal'], 
         [12000, 10000, 8000], 5, 'kg'),
        ('Semangka', ['merah', 'kuning', 'tanpa biji'], 
         [8000, 10000, 12000], 7, 'kg'),
        ('Melon', ['golden', 'honeydew', 'rockmelon'], 
         [15000, 14000, 18000], 7, 'kg'),
        ('Anggur', ['hijau', 'merah', 'hitam'], 
         [50000, 55000, 60000], 7, 'kg'),
        ('Strawberry', ['lokal', 'import'], [40000, 60000], 3, 'kg'),
        ('Alpukat', ['mentega', 'kendil', 'aligator'], 
         [20000, 18000, 22000], 7, 'kg'),
    ],
    'Sembako': [
        ('Beras', ['premium', 'medium', 'ekonomis', 'pera', 'pulen', 'merah', 'hitam'], 
         [15000, 12000, 10000, 14000, 13000, 20000, 25000], 180, 'kg'),
        ('Mie Instan', ['goreng', 'kuah', 'jumbo', 'premium'], 
         [3000, 2800, 3500, 4000], 180, 'pcs'),
        ('Minyak Goreng', ['kemasan', 'curah', 'premium', 'kelapa sawit'], 
         [20000, 18000, 22000, 24000], 180, 'liter'),
        ('Gula Pasir', ['premium', 'lokal', 'organik'], 
         [14000, 12000, 18000], 180, 'kg'),
        ('Garam', ['halus', 'kasar', 'beryodium', 'laut'], 
         [4000, 3000, 4500, 5000], 360, 'kg'),
        ('LPG', ['3kg', 'pink'], [22000, 24000], 180, 'tabung'),
        ('Susu Kental Manis', ['kaleng', 'sachet'], [12000, 2000], 180, 'pcs'),
        ('Kacang Hijau', ['kupas', 'utuh'], [24000, 22000], 180, 'kg'),
        ('Kacang Kedelai', ['lokal', 'import', 'kuning', 'hitam'], 
         [14000, 16000, 15000, 18000], 180, 'kg'),
        ('Kacang Tanah', ['kupas', 'kulit', 'sangrai'], 
         [28000, 24000, 30000], 90, 'kg'),
        ('Tempe', ['segar', 'kedelai hitam', 'goreng'], 
         [12000, 15000, 18000], 3, 'kg'),
        ('Tahu', ['putih', 'kuning', 'sutra', 'jepang'], 
         [8000, 7000, 10000, 12000], 3, 'kg'),
        ('Tepung Terigu', ['segitiga biru', 'cakra kembar', 'kunci biru'], 
         [14000, 13000, 15000], 180, 'kg'),
        ('Tepung Beras', ['ros brand', 'lokal'], [12000, 10000], 180, 'kg'),
        ('Maizena', ['maizenaku', 'biasa'], [15000, 12000], 360, 'kg'),
        ('Santan', ['kara', 'instan', 'kelapa murni'], 
         [8000, 6000, 10000], 30, 'pcs'),
    ]
}

# Variasi tambahan untuk mencapai target
QUALITY_VARIANTS = ['premium', 'super', 'pilihan', 'ekonomis', 'reguler', 'special']
ORIGIN_VARIANTS = ['Jawa Timur', 'Jawa Barat', 'Jawa Tengah', 'Lampung', 'Sumatera', 'Sulawesi', 'Bali', 'Kalimantan']
FRESHNESS = ['segar pagi', 'fresh', 'beku', 'chilled', 'frozen']
SIZE_VARIANTS = ['jumbo', 'besar', 'sedang', 'kecil', 'mini']


def generate_product_name(base_name: str, variant: str) -> str:
    """
    Generate product name dari base + variant
    
    Args:
        base_name: Nama dasar produk (e.g., "Udang")
        variant: Variasi produk (e.g., "besar premium")
    
    Returns:
        Nama produk lengkap (e.g., "Udang besar premium")
    """
    return f"{base_name} {variant}".strip()


def generate_price_variation(base_price: int, quality: str = 'reguler') -> int:
    """
    Generate harga dengan variasi berdasarkan quality
    
    Args:
        base_price: Harga dasar
        quality: Tipe kualitas produk
    
    Returns:
        Harga setelah adjustment
    """
    adjustments = {
        'premium': (1.20, 1.35),
        'super': (1.15, 1.25),
        'special': (1.10, 1.20),
        'pilihan': (1.05, 1.15),
        'reguler': (0.95, 1.05),
        'ekonomis': (0.80, 0.95)
    }
    
    min_mult, max_mult = adjustments.get(quality, (0.95, 1.05))
    return int(base_price * np.random.uniform(min_mult, max_mult))


def generate_balanced_products(
    total_products: int = 1000,
    category_targets: dict = None
) -> list:
    """
    ✅ FUNGSI UTAMA: Generate produk dengan BALANCED distribution
    
    Args:
        total_products: Total produk yang ingin di-generate
        category_targets: Dict target count per kategori (optional)
    
    Returns:
        List of product dictionaries
    """
    if category_targets is None:
        category_targets = CATEGORY_TARGET_COUNTS
    
    print("=" * 70)
    print(f"GENERATING {total_products} BALANCED PRODUCTS")
    print("=" * 70)
    
    products = []
    
    for category_name, category_id in CATEGORIES.items():
        target_count = category_targets.get(category_name, 140)
        
        print(f"\n📦 Generating {category_name}: Target = {target_count} products...")
        
        if category_name not in BASE_PRODUCTS:
            print(f"   ⚠️ No base products for {category_name}, skipping...")
            continue
        
        base_items = BASE_PRODUCTS[category_name]
        category_products = []
        
        # Hitung berapa produk per base item
        products_per_base = target_count // len(base_items)
        remainder = target_count % len(base_items)
        
        for base_idx, (base_name, variants, prices, shelf_life, unit) in enumerate(base_items):
            # Tambah 1 produk untuk base_idx pertama untuk handle remainder
            item_target = products_per_base + (1 if base_idx < remainder else 0)
            
            for i in range(item_target):
                # Pilih variant dari list yang tersedia
                if i < len(variants):
                    variant = variants[i]
                    base_price = prices[i] if i < len(prices) else prices[0]
                else:
                    # Generate additional variant dengan kombinasi
                    variant_idx = i % len(variants)
                    variant = variants[variant_idx]
                    base_price = prices[variant_idx] if variant_idx < len(prices) else prices[0]
                    
                    # Tambah variasi quality/origin/size
                    if i % 5 == 0:
                        quality = np.random.choice(QUALITY_VARIANTS)
                        variant = f"{variant} {quality}"
                        base_price = generate_price_variation(base_price, quality)
                    elif i % 5 == 1:
                        origin = np.random.choice(ORIGIN_VARIANTS)
                        variant = f"{variant} {origin}"
                    elif i % 5 == 2:
                        freshness = np.random.choice(FRESHNESS)
                        variant = f"{variant} {freshness}"
                    elif i % 5 == 3:
                        size = np.random.choice(SIZE_VARIANTS)
                        variant = f"{size} {variant}"
                    else:
                        # Kombinasi quality + origin
                        quality = np.random.choice(QUALITY_VARIANTS[:3])
                        origin = np.random.choice(ORIGIN_VARIANTS[:4])
                        variant = f"{variant} {quality} {origin}"
                        base_price = generate_price_variation(base_price, quality)
                
                # Generate final product
                product_name = generate_product_name(base_name, variant)
                final_price = int(base_price * np.random.uniform(0.98, 1.02))  # Small random
                stock = np.random.randint(30, 120)
                
                # Random creation date (last 90 days)
                days_ago = np.random.randint(0, 90)
                created_date = datetime.now() - timedelta(days=days_ago)
                
                product = {
                    'id': str(uuid.uuid4()),
                    'name': product_name,
                    'category_id': category_id,
                    'category_name': category_name,
                    'product_type': 'online',
                    'selling_price': final_price,
                    'quantity_info': unit,
                    'shelf_life_days': shelf_life,
                    'total_stock': stock,
                    'description': f"{product_name} berkualitas tinggi untuk kebutuhan dapur Anda",
                    'is_active': True,
                    'created_at': created_date.strftime('%Y-%m-%d %H:%M:%S')
                }
                
                category_products.append(product)
        
        # Pastikan tepat sesuai target (trim atau tambah jika perlu)
        if len(category_products) > target_count:
            category_products = category_products[:target_count]
        elif len(category_products) < target_count:
            # Duplicate beberapa produk random untuk mencapai target
            shortage = target_count - len(category_products)
            extras = np.random.choice(category_products, shortage, replace=True)
            for extra in extras:
                # Buat copy dengan UUID baru
                new_product = extra.copy()
                new_product['id'] = str(uuid.uuid4())
                new_product['name'] = f"{extra['name']} variant"
                category_products.append(new_product)
        
        products.extend(category_products)
        print(f"   ✅ Generated {len(category_products)} products untuk {category_name}")
    
    print(f"\n{'='*70}")
    print(f"✅ TOTAL GENERATED: {len(products)} products")
    print(f"{'='*70}")
    
    return products


def print_statistics(df: pd.DataFrame):
    """
    Print statistik dataset yang di-generate
    
    Args:
        df: DataFrame produk
    """
    print("\n" + "=" * 70)
    print("📊 DATASET STATISTICS")
    print("=" * 70)
    
    # Total
    print(f"\n📦 Total Products: {len(df)}")
    
    # Category distribution
    print(f"\n📋 Category Distribution:")
    category_counts = df['category_name'].value_counts().sort_index()
    for cat, count in category_counts.items():
        percentage = count / len(df) * 100
        print(f"   • {cat:20s}: {count:4d} products ({percentage:5.2f}%)")
    
    # Check balance
    print(f"\n⚖️  Balance Check:")
    mean_count = category_counts.mean()
    std_count = category_counts.std()
    cv = (std_count / mean_count) * 100  # Coefficient of Variation
    print(f"   • Mean per category: {mean_count:.1f}")
    print(f"   • Std deviation: {std_count:.2f}")
    print(f"   • Coefficient of Variation: {cv:.2f}%")
    if cv < 5:
        print(f"   ✅ EXCELLENT BALANCE (CV < 5%)")
    elif cv < 10:
        print(f"   ✅ GOOD BALANCE (CV < 10%)")
    else:
        print(f"   ⚠️ IMBALANCED (CV >= 10%)")
    
    # Price distribution
    print(f"\n💰 Price Distribution:")
    print(f"   • Min:    Rp {df['selling_price'].min():>12,}")
    print(f"   • Max:    Rp {df['selling_price'].max():>12,}")
    print(f"   • Mean:   Rp {df['selling_price'].mean():>12,.0f}")
    print(f"   • Median: Rp {df['selling_price'].median():>12,.0f}")
    
    # Shelf life distribution
    print(f"\n📅 Shelf Life Distribution:")
    shelf_life_dist = df['shelf_life_days'].value_counts().sort_index()
    for days, count in shelf_life_dist.items():
        print(f"   • {days:3d} days: {count:4d} products")
    
    print("=" * 70)


def main():
    """
    Main function untuk generate dan save dataset
    """
    # Generate 1000 produk balanced
    products = generate_balanced_products(
        total_products=1000,
        category_targets=CATEGORY_TARGET_COUNTS
    )
    
    # Convert ke DataFrame
    df = pd.DataFrame(products)
    
    # Print statistics
    print_statistics(df)
    
    # Save to CSV
    output_dir = Path(__file__).parent.parent / 'data' / 'raw'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / 'products_1000_balanced.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n💾 SAVED TO: {output_file}")
    print(f"✅ File size: {output_file.stat().st_size / 1024:.2f} KB")
    
    print("\n" + "=" * 70)
    print("🎉 GENERATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Run data splitter untuk split train/val/test")
    print("2. Train NCB v3 model")
    print("3. Evaluate dengan comprehensive metrics")


if __name__ == "__main__":
    main()
