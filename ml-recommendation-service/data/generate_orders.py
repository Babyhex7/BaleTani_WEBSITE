"""
Script untuk generate dummy orders dengan co-occurrence pattern realistis
Dijalankan untuk membuat orders.csv dengan 500 orders untuk training
"""
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

# Bundle produk yang sering dibeli bersamaan (realistis untuk masak)
BUNDLES = {
    'seafood_combo': [1, 2, 3, 4, 5],  # Berbagai udang + cumi
    'bumbu_masak': [19, 33, 32, 14, 13],  # Tomat, cabe, bawang putih, jahe, sereh
    'ayam_paket': [7, 8, 9, 10, 12],  # Berbagai bagian ayam
    'sayur_sup': [22, 36, 38, 46],  # Kentang, wortel, jagung, kol
    'fruit_basket': [24, 40, 51, 27],  # Apel, jeruk, pisang, salak
    'bumbu_dasar': [32, 33, 19, 14, 18],  # Bawang putih, cabe, tomat, jahe, kunyit
    'lauk_protein': [7, 1, 31, 11],  # Ayam filet, udang, daging sapi, telur puyuh
    'sayur_hijau': [34, 35, 37, 20, 21],  # Daun singkong, seledri, daun bawang, salam, daun jeruk
    'gorengan_paket': [48, 57, 42, 56],  # Minyak, tepung, kedelai, tahu
    'ikan_segar': [6, 15, 30],  # Kembung, bawal, tongkol
    'telur_combo': [11, 53, 54],  # Berbagai jenis telur
    'rempah_lengkap': [13, 14, 16, 17, 18],  # Sereh, jahe, kencur, lengkuas, kunyit
    'umbi_umbian': [22, 36, 44, 45],  # Kentang, wortel, kentang dieng, singkong
    'kacang_kacangan': [41, 42, 43, 23],  # Kacang hijau, kedelai, tanah, pete
    'bahan_pokok': [47, 48, 50, 52, 57],  # Mie, minyak, gas, susu, tepung
}

def generate_order_id(index):
    """Generate order ID dengan format ORD-YYYYMMDD-XXXX"""
    return f"ORD-{index:04d}"

def generate_random_date(start_date, end_date):
    """Generate random date antara start dan end"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start_date + timedelta(days=random_days)

def generate_orders(num_orders=500):
    """Generate dummy orders dengan pattern realistis"""
    
    orders = []
    order_counter = 1
    
    # Customer IDs yang tersedia
    customers = [f"CUST-{i:03d}" for i in range(1, 21)]
    
    # Date range: 3 bulan terakhir
    end_date = datetime(2025, 3, 1)
    start_date = end_date - timedelta(days=90)
    
    for i in range(num_orders):
        customer_id = random.choice(customers)
        order_date = generate_random_date(start_date, end_date)
        order_id = generate_order_id(order_counter)
        
        # 70% bundle order, 30% random items
        if random.random() < 0.7:
            # Pilih bundle
            bundle_name = random.choice(list(BUNDLES.keys()))
            bundle_products = BUNDLES[bundle_name]
            
            # Ambil 2-4 item dari bundle
            num_items = random.randint(2, min(4, len(bundle_products)))
            selected_products = random.sample(bundle_products, num_items)
        else:
            # Random 2-5 produk
            all_product_ids = list(range(1, 58))
            num_items = random.randint(2, 5)
            selected_products = random.sample(all_product_ids, num_items)
        
        # Status order (95% completed, 5% cancelled)
        status = 'completed' if random.random() < 0.95 else 'cancelled'
        
        # Generate order items
        for product_id in selected_products:
            # Quantity berdasarkan jenis produk
            if product_id in [20, 21, 29, 45, 53]:  # Per ikat/pcs
                quantity = random.randint(1, 3)
            elif product_id in [47, 50, 52]:  # Per pcs (instant goods)
                quantity = random.randint(2, 10)
            else:  # Per kg
                quantity = random.randint(1, 5)
            
            # Estimate price (simplified - dalam real akan dari products.csv)
            # Untuk dummy data, kita set price range
            if product_id <= 10:  # Protein laut & daging
                base_price = random.choice([30000, 40000, 65000, 70000])
            elif product_id <= 20:  # Bumbu
                base_price = random.choice([12000, 18000, 20000, 32000])
            elif product_id <= 40:  # Sayur
                base_price = random.choice([5000, 10000, 14000, 18000])
            elif product_id <= 51:  # Buah
                base_price = random.choice([10000, 20000, 24000, 30000])
            else:  # Bahan kering
                base_price = random.choice([3000, 12000, 18000, 24000])
            
            total_price = base_price * quantity
            
            orders.append({
                'order_id': order_id,
                'customer_id': customer_id,
                'product_id': product_id,
                'quantity': quantity,
                'total_price': total_price,
                'order_date': order_date.strftime('%Y-%m-%d'),
                'order_status': status
            })
        
        order_counter += 1
    
    return orders

def save_to_csv(orders, filename='orders.csv'):
    """Save orders to CSV file"""
    fieldnames = ['order_id', 'customer_id', 'product_id', 'quantity', 
                  'total_price', 'order_date', 'order_status']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(orders)
    
    print(f"✅ Generated {len(orders)} order items in {filename}")

if __name__ == '__main__':
    # Generate 500 orders
    orders = generate_orders(500)
    
    # Save to data/raw/orders.csv
    output_path = Path(__file__).parent / 'raw' / 'orders.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    save_to_csv(orders, str(output_path))
    
    # Print statistics
    unique_orders = len(set(o['order_id'] for o in orders))
    unique_customers = len(set(o['customer_id'] for o in orders))
    completed = len([o for o in orders if o['order_status'] == 'completed'])
    
    print(f"\n📊 Statistics:")
    print(f"   - Total order items: {len(orders)}")
    print(f"   - Unique orders: {unique_orders}")
    print(f"   - Unique customers: {unique_customers}")
    print(f"   - Completed orders: {completed} ({completed/len(orders)*100:.1f}%)")
