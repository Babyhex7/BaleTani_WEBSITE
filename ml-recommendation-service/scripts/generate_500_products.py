"""
Generate 500 Synthetic Products untuk Training NCB v2
Based on 57 real products dengan variations
"""
import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Categories dengan UUID tetap
CATEGORIES = {
    'Protein Laut': '660e8400-e29b-41d4-a716-446655440001',
    'Protein Daging': '660e8400-e29b-41d4-a716-446655440002',
    'Protein Telur': '660e8400-e29b-41d4-a716-446655440003',
    'Bumbu & Rempah': '660e8400-e29b-41d4-a716-446655440004',
    'Sayuran': '660e8400-e29b-41d4-a716-446655440005',
    'Buah': '660e8400-e29b-41d4-a716-446655440006',
    'Sembako': '660e8400-e29b-41d4-a716-446655440007'
}

# Base products untuk generate variations
BASE_PRODUCTS = {
    'Protein Laut': [
        ('Udang', ['kecil', 'sedang', 'besar', 'jumbo'], [40000, 65000, 85000, 110000], 3, 'kg'),
        ('Cumi', ['kecil', 'sedang', 'besar'], [50000, 65000, 80000], 2, 'kg'),
        ('Ikan Kembung', ['segar', 'beku'], [30000, 25000], 2, 'kg'),
        ('Bawal', ['segar', 'fillet'], [35000, 45000], 2, 'kg'),
        ('Tongkol', ['utuh', 'fillet'], [40000, 50000], 2, 'kg'),
        ('Cengek', ['segar'], [75000], 2, 'kg'),
        ('Kakap', ['merah', 'putih'], [90000, 85000], 2, 'kg'),
        ('Salmon', ['segar', 'fillet', 'steak'], [150000, 180000, 200000], 2, 'kg'),
        ('Kerang', ['hijau', 'darah'], [25000, 30000], 1, 'kg'),
        ('Kepiting', ['segar'], [120000], 2, 'kg'),
    ],
    'Protein Daging': [
        ('Ayam filet', ['dada', 'paha'], [43000, 38000], 3, 'kg'),
        ('Ceker Ayam', ['segar', 'beku'], [15000, 13000], 5, 'kg'),
        ('Sayap Ayam', ['segar', 'bumbu'], [35000, 38000], 3, 'kg'),
        ('Ayam potong', ['all part', 'karkas'], [35000, 33000], 3, 'kg'),
        ('Ayam', ['kampung', 'negeri'], [45000, 27000], 3, 'kg'),
        ('Daging Sapi', ['has dalam', 'has luar', 'paha'], [140000, 130000, 120000], 3, 'kg'),
        ('Daging Kambing', ['muda', 'dewasa'], [130000, 120000], 3, 'kg'),
        ('Iga Sapi', ['segar'], [110000], 3, 'kg'),
    ],
    'Protein Telur': [
        ('Telur Ayam Kampung', ['organik', 'biasa'], [4000, 3000], 14, 'pcs'),
        ('Telur Ayam Ras', ['omega 3', 'biasa'], [32000, 29000], 14, 'kg'),
        ('Telur Puyuh', ['segar'], [40000], 10, 'kg'),
        ('Telur Bebek', ['asin', 'segar'], [35000, 30000], 14, 'kg'),
    ],
    'Bumbu & Rempah': [
        ('Sereh', ['segar'], [12000], 7, 'kg'),
        ('Jahe', ['merah', 'putih', 'emprit'], [35000, 32000, 28000], 14, 'kg'),
        ('Cikur/Kencur', ['segar'], [50000], 14, 'kg'),
        ('Lengkuas', ['segar'], [20000], 14, 'kg'),
        ('Kunyit', ['segar'], [18000], 14, 'kg'),
        ('Tomat', ['merah', 'hijau'], [10000, 9000], 5, 'kg'),
        ('Daun Salam', ['segar'], [500], 7, 'iket'),
        ('Daun Jeruk', ['segar'], [2000], 7, 'pak'),
        ('Bawang Putih', ['lokal', 'import'], [40000, 35000], 30, 'kg'),
        ('Cabe Kriting', ['merah', 'hijau'], [72000, 65000], 7, 'kg'),
        ('Cabe Rawit', ['merah', 'hijau'], [80000, 75000], 7, 'kg'),
        ('Suraung/Bawang Daun', ['segar'], [15000], 5, 'iket'),
        ('Sledri/Seledri', ['segar'], [20000], 5, 'kg'),
        ('Daun Bawang', ['segar'], [12000], 5, 'kg'),
        ('Bawang Merah', ['lokal', 'import'], [45000, 38000], 30, 'kg'),
        ('Kemiri', ['kupas'], [60000], 180, 'kg'),
        ('Lada', ['hitam', 'putih'], [120000, 110000], 360, 'kg'),
        ('Ketumbar', ['bubuk', 'biji'], [25000, 22000], 180, 'kg'),
    ],
    'Sayuran': [
        ('Kentang', ['granola', 'lokal dieng', 'biasa'], [20000, 17000, 18000], 14, 'kg'),
        ('Pete', ['segar', 'kupas'], [30000, 35000], 3, 'iket'),
        ('Wortel', ['segar'], [14000], 14, 'kg'),
        ('Jagung Manis', ['pipilan', 'tongkol'], [10000, 8000], 3, 'kg'),
        ('Jagung Pipilan', ['kering'], [12000], 30, 'kg'),
        ('Ketela Pohon', ['segar'], [5000], 7, 'pcs'),
        ('Kol/Kubis', ['putih', 'ungu'], [7000, 9000], 7, 'kg'),
        ('Bayam', ['merah', 'hijau'], [8000, 7000], 2, 'kg'),
        ('Kangkung', ['air', 'darat'], [6000, 5000], 2, 'kg'),
        ('Terong', ['ungu', 'hijau'], [7000, 6000], 5, 'kg'),
        ('Labu Siam', ['segar'], [8000], 14, 'kg'),
        ('Buncis', ['segar'], [12000], 5, 'kg'),
        ('Kacang Panjang', ['segar'], [10000], 5, 'kg'),
        ('Brokoli', ['segar'], [20000], 5, 'kg'),
        ('Sawi', ['hijau', 'putih'], [8000, 7000], 3, 'kg'),
    ],
    'Buah': [
        ('Apel', ['fuji', 'malang', 'washington'], [35000, 30000, 40000], 14, 'kg'),
        ('Lemon', ['premium import', 'lokal', 'cui'], [35000, 20000, 15000], 14, 'kg'),
        ('Salak', ['pondoh', 'bali'], [12000, 10000], 7, 'kg'),
        ('Manggis', ['segar'], [17000], 7, 'kg'),
        ('Nanas', ['madu', 'biasa'], [15000, 12000], 7, 'pcs'),
        ('Jeruk', ['sunkist', 'santang', 'baby'], [30000, 24000, 20000], 14, 'kg'),
        ('Pisang', ['cavendish', 'raja', 'kepok'], [28000, 24000, 18000], 7, 'kg'),
        ('Mangga', ['harum manis', 'gedong', 'manalagi'], [25000, 20000, 22000], 7, 'kg'),
        ('Pepaya', ['california', 'bangkok'], [12000, 10000], 5, 'kg'),
        ('Semangka', ['merah', 'kuning'], [8000, 10000], 7, 'kg'),
    ],
    'Sembako': [
        ('Beras', ['premium', 'medium', 'ekonomis'], [15000, 12000, 10000], 180, 'kg'),
        ('Mie Instan', ['goreng', 'kuah'], [3000, 2800], 180, 'pcs'),
        ('Minyak Goreng', ['kemasan', 'curah'], [20000, 18000], 180, 'kg'),
        ('Gula Pasir', ['premium', 'lokal'], [14000, 12000], 180, 'kg'),
        ('Garam', ['halus', 'kasar'], [4000, 3000], 360, 'kg'),
        ('LPG', ['3kg'], [22000], 180, 'pcs'),
        ('Susu Kental Manis', ['kaleng'], [12000], 180, 'pcs'),
        ('Kacang Hijau', ['kupas'], [24000], 180, 'kg'),
        ('Kacang Kedelai', ['lokal'], [14000], 180, 'kg'),
        ('Kacang Tanah', ['kupas'], [28000], 90, 'kg'),
        ('Tempe', ['segar'], [12000], 3, 'kg'),
        ('Tahu', ['putih', 'kuning'], [8000, 7000], 3, 'kg'),
        ('Tepung Terigu', ['segitiga biru', 'cakra kembar'], [14000, 13000], 180, 'kg'),
        ('Tepung Beras', ['ros brand'], [12000], 180, 'kg'),
        ('Maizena', ['maizenaku'], [15000], 360, 'kg'),
    ]
}

# Quality variations
QUALITY_VARIANTS = ['premium', 'super', 'pilihan', 'ekonomis', 'reguler']
ORIGIN_VARIANTS = ['Jawa Timur', 'Jawa Barat', 'Jawa Tengah', 'Lampung', 'Sumatera', 'Sulawesi', 'Lokal']
FRESHNESS = ['segar pagi', 'fresh', 'beku', 'chilled']
PACKAGING = ['500gr', '1kg', '2kg', '5kg', 'pack isi 3', 'pack isi 5']

def generate_product_name(base_name, variant, additional=''):
    """Generate product name dengan variations"""
    if additional:
        return f"{base_name} {variant} {additional}".strip()
    return f"{base_name} {variant}".strip()

def generate_price_variation(base_price, variation_type):
    """Generate price dengan variation"""
    if variation_type == 'premium':
        return int(base_price * np.random.uniform(1.15, 1.30))
    elif variation_type == 'super':
        return int(base_price * np.random.uniform(1.10, 1.20))
    elif variation_type == 'ekonomis':
        return int(base_price * np.random.uniform(0.80, 0.90))
    elif variation_type == 'reguler':
        return int(base_price * np.random.uniform(0.95, 1.05))
    else:
        return int(base_price * np.random.uniform(0.90, 1.10))

def generate_500_products():
    """Generate 500 produk synthetic"""
    products = []
    product_counter = 1
    
    for category_name, category_id in CATEGORIES.items():
        if category_name not in BASE_PRODUCTS:
            continue
        
        base_items = BASE_PRODUCTS[category_name]
        
        # Calculate berapa produk per category (proportional)
        if category_name == 'Protein Laut':
            target_count = 80
        elif category_name == 'Protein Daging':
            target_count = 60
        elif category_name == 'Protein Telur':
            target_count = 40
        elif category_name == 'Bumbu & Rempah':
            target_count = 120
        elif category_name == 'Sayuran':
            target_count = 100
        elif category_name == 'Buah':
            target_count = 60
        else:  # Sembako
            target_count = 40
        
        products_per_base = max(1, target_count // len(base_items))
        
        for base_name, variants, prices, shelf_life, unit in base_items:
            # Generate extra variants to hit 500
            extra = 5 if len(products) < 450 else 3
            for i in range(products_per_base + extra):
                # Pick variant
                if i < len(variants):
                    variant = variants[i]
                    base_price = prices[i] if i < len(prices) else prices[0]
                else:
                    # Generate additional variants
                    variant_idx = i % len(variants)
                    variant = variants[variant_idx]
                    base_price = prices[variant_idx] if variant_idx < len(prices) else prices[0]
                    
                    # Add quality/origin variation
                    if i % 3 == 0 and len(QUALITY_VARIANTS) > 0:
                        quality = np.random.choice(QUALITY_VARIANTS)
                        variant = f"{variant} {quality}"
                        base_price = generate_price_variation(base_price, quality)
                    elif i % 3 == 1 and category_name in ['Protein Laut', 'Sayuran', 'Buah']:
                        origin = np.random.choice(ORIGIN_VARIANTS)
                        variant = f"{variant} {origin}"
                    elif i % 3 == 2 and category_name in ['Protein Laut', 'Protein Daging']:
                        fresh = np.random.choice(FRESHNESS)
                        variant = f"{variant} {fresh}"
                
                # Generate product
                product_name = generate_product_name(base_name, variant)
                price = int(base_price * np.random.uniform(0.95, 1.05))  # Small random variation
                stock = np.random.randint(20, 100)
                
                # Random date dalam last 2 bulan
                days_ago = np.random.randint(0, 60)
                created_date = datetime.now() - timedelta(days=days_ago)
                
                product = {
                    'id': str(uuid.uuid4()),
                    'name': product_name,
                    'category_id': category_id,
                    'category_name': category_name,
                    'product_type': 'online',
                    'selling_price': price,
                    'quantity_info': unit,
                    'shelf_life_days': shelf_life,
                    'total_stock': stock,
                    'description': f"{product_name} berkualitas tinggi untuk kebutuhan dapur Anda",
                    'is_active': True,
                    'created_at': created_date.strftime('%Y-%m-%d %H:%M:%S')
                }
                
                products.append(product)
                product_counter += 1
                
                if product_counter > 500:
                    break
            
            if product_counter > 500:
                break
        
        if product_counter > 500:
            break
    
    return products[:500]  # Ensure exactly 500

def main():
    """Main function"""
    print("=" * 60)
    print("GENERATING 500 SYNTHETIC PRODUCTS")
    print("=" * 60)
    
    # Generate products
    products = generate_500_products()
    
    print(f"\n✅ Generated {len(products)} products")
    
    # Convert to DataFrame
    df = pd.DataFrame(products)
    
    # Category distribution
    print("\n📊 Category Distribution:")
    for cat, count in df['category_name'].value_counts().items():
        print(f"   • {cat}: {count} products ({count/len(df)*100:.1f}%)")
    
    # Price distribution
    print(f"\n💰 Price Range:")
    print(f"   Min: Rp {df['selling_price'].min():,}")
    print(f"   Max: Rp {df['selling_price'].max():,}")
    print(f"   Mean: Rp {df['selling_price'].mean():,.0f}")
    
    # Save to CSV
    output_dir = Path(__file__).parent.parent / 'data' / 'raw'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / 'products_500_training.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n✅ Saved to: {output_file}")
    print("\n" + "=" * 60)
    print("GENERATION COMPLETED!")
    print("=" * 60)

if __name__ == "__main__":
    main()
