"""
Script untuk regenerate CSV data dengan UUID format
Sesuai dengan schema backend yang pakai UUID v4
"""
import csv
import uuid
from datetime import datetime, timedelta
import random
from pathlib import Path

# Data categories dengan UUID
CATEGORIES = {
    'Protein Laut': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440001')),
    'Protein Daging': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440002')),
    'Protein Telur': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440003')),
    'Bumbu': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440004')),
    'Sayur': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440005')),
    'Buah': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440006')),
    'Bahan Kering': str(uuid.UUID('660e8400-e29b-41d4-a716-446655440007'))
}

# Product data dengan UUID
PRODUCTS = [
    # Protein Laut
    {'id': str(uuid.uuid4()), 'name': 'Udang sedang 1', 'category': 'Protein Laut', 'type': 'online', 'price': 65000, 'unit': '1 kg', 'shelf_life': 3, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Udang sedang 2', 'category': 'Protein Laut', 'type': 'online', 'price': 70000, 'unit': '1 kg', 'shelf_life': 3, 'stock': 45},
    {'id': str(uuid.uuid4()), 'name': 'Udang besar', 'category': 'Protein Laut', 'type': 'online', 'price': 85000, 'unit': '1 kg', 'shelf_life': 3, 'stock': 30},
    {'id': str(uuid.uuid4()), 'name': 'Udang kecil', 'category': 'Protein Laut', 'type': 'online', 'price': 40000, 'unit': '1 kg', 'shelf_life': 3, 'stock': 60},
    {'id': str(uuid.uuid4()), 'name': 'Cumi', 'category': 'Protein Laut', 'type': 'online', 'price': 65000, 'unit': '1 kg', 'shelf_life': 2, 'stock': 35},
    {'id': str(uuid.uuid4()), 'name': 'Ikan kembung', 'category': 'Protein Laut', 'type': 'online', 'price': 35000, 'unit': '1 kg', 'shelf_life': 2, 'stock': 40},
    
    # Protein Daging
    {'id': str(uuid.uuid4()), 'name': 'Ayam filet 500g', 'category': 'Protein Daging', 'type': 'online', 'price': 45000, 'unit': '500 g', 'shelf_life': 5, 'stock': 70},
    {'id': str(uuid.uuid4()), 'name': 'Ayam potong segar', 'category': 'Protein Daging', 'type': 'online', 'price': 38000, 'unit': '1 kg', 'shelf_life': 5, 'stock': 80},
    {'id': str(uuid.uuid4()), 'name': 'Ayam kampung utuh', 'category': 'Protein Daging', 'type': 'online', 'price': 95000, 'unit': '1 ekor', 'shelf_life': 5, 'stock': 25},
    {'id': str(uuid.uuid4()), 'name': 'Ayam ras all part', 'category': 'Protein Daging', 'type': 'online', 'price': 42000, 'unit': '1 kg', 'shelf_life': 5, 'stock': 60},
    
    # Protein Telur
    {'id': str(uuid.uuid4()), 'name': 'Telur puyuh 1 kg', 'category': 'Protein Telur', 'type': 'online', 'price': 28000, 'unit': '1 kg', 'shelf_life': 14, 'stock': 90},
    {'id': str(uuid.uuid4()), 'name': 'Telur ayam negeri', 'category': 'Protein Telur', 'type': 'online', 'price': 32000, 'unit': '1 kg', 'shelf_life': 21, 'stock': 100},
    
    # Bumbu
    {'id': str(uuid.uuid4()), 'name': 'Sereh 1 ikat', 'category': 'Bumbu', 'type': 'online', 'price': 5000, 'unit': '1 ikat', 'shelf_life': 7, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Jahe 250g', 'category': 'Bumbu', 'type': 'online', 'price': 8000, 'unit': '250 g', 'shelf_life': 14, 'stock': 45},
    {'id': str(uuid.uuid4()), 'name': 'Bawal', 'category': 'Protein Laut', 'type': 'online', 'price': 75000, 'unit': '1 kg', 'shelf_life': 2, 'stock': 28},
    {'id': str(uuid.uuid4()), 'name': 'Kencur 200g', 'category': 'Bumbu', 'type': 'online', 'price': 6000, 'unit': '200 g', 'shelf_life': 10, 'stock': 40},
    {'id': str(uuid.uuid4()), 'name': 'Lengkuas 300g', 'category': 'Bumbu', 'type': 'online', 'price': 7000, 'unit': '300 g', 'shelf_life': 12, 'stock': 38},
    {'id': str(uuid.uuid4()), 'name': 'Kunyit 250g', 'category': 'Bumbu', 'type': 'online', 'price': 9000, 'unit': '250 g', 'shelf_life': 10, 'stock': 42},
    {'id': str(uuid.uuid4()), 'name': 'Tomat 1 kg', 'category': 'Bumbu', 'type': 'online', 'price': 12000, 'unit': '1 kg', 'shelf_life': 7, 'stock': 70},
    
    # Sayur
    {'id': str(uuid.uuid4()), 'name': 'Daun salam 100g', 'category': 'Sayur', 'type': 'online', 'price': 3000, 'unit': '100 g', 'shelf_life': 5, 'stock': 60},
    {'id': str(uuid.uuid4()), 'name': 'Daun jeruk 50g', 'category': 'Sayur', 'type': 'online', 'price': 4000, 'unit': '50 g', 'shelf_life': 5, 'stock': 55},
    {'id': str(uuid.uuid4()), 'name': 'Kentang 1 kg', 'category': 'Sayur', 'type': 'online', 'price': 18000, 'unit': '1 kg', 'shelf_life': 30, 'stock': 80},
    {'id': str(uuid.uuid4()), 'name': 'Pete 500g', 'category': 'Sayur', 'type': 'online', 'price': 25000, 'unit': '500 g', 'shelf_life': 7, 'stock': 35},
    {'id': str(uuid.uuid4()), 'name': 'Apel fuji 1 kg', 'category': 'Buah', 'type': 'online', 'price': 45000, 'unit': '1 kg', 'shelf_life': 14, 'stock': 50},
    
    # Buah
    {'id': str(uuid.uuid4()), 'name': 'Salak pondoh 1 kg', 'category': 'Buah', 'type': 'online', 'price': 20000, 'unit': '1 kg', 'shelf_life': 7, 'stock': 40},
    {'id': str(uuid.uuid4()), 'name': 'Tongkol', 'category': 'Protein Laut', 'type': 'online', 'price': 55000, 'unit': '1 kg', 'shelf_life': 2, 'stock': 32},
    {'id': str(uuid.uuid4()), 'name': 'Daging sapi 500g', 'category': 'Protein Daging', 'type': 'online', 'price': 120000, 'unit': '500 g', 'shelf_life': 7, 'stock': 20},
    {'id': str(uuid.uuid4()), 'name': 'Bawang putih 250g', 'category': 'Bumbu', 'type': 'online', 'price': 15000, 'unit': '250 g', 'shelf_life': 30, 'stock': 65},
    {'id': str(uuid.uuid4()), 'name': 'Cabai merah 500g', 'category': 'Bumbu', 'type': 'online', 'price': 35000, 'unit': '500 g', 'shelf_life': 7, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Daun singkong 1 ikat', 'category': 'Sayur', 'type': 'online', 'price': 5000, 'unit': '1 ikat', 'shelf_life': 3, 'stock': 45},
    {'id': str(uuid.uuid4()), 'name': 'Seledri 1 ikat', 'category': 'Sayur', 'type': 'online', 'price': 4000, 'unit': '1 ikat', 'shelf_life': 5, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Wortel 1 kg', 'category': 'Sayur', 'type': 'online', 'price': 15000, 'unit': '1 kg', 'shelf_life': 21, 'stock': 70},
    {'id': str(uuid.uuid4()), 'name': 'Daun bawang 1 ikat', 'category': 'Sayur', 'type': 'online', 'price': 6000, 'unit': '1 ikat', 'shelf_life': 5, 'stock': 55},
    {'id': str(uuid.uuid4()), 'name': 'Brokoli 500g', 'category': 'Sayur', 'type': 'online', 'price': 22000, 'unit': '500 g', 'shelf_life': 7, 'stock': 40},
    {'id': str(uuid.uuid4()), 'name': 'Jeruk medan 1 kg', 'category': 'Buah', 'type': 'online', 'price': 35000, 'unit': '1 kg', 'shelf_life': 14, 'stock': 55},
    {'id': str(uuid.uuid4()), 'name': 'Kacang hijau 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 28000, 'unit': '1 kg', 'shelf_life': 180, 'stock': 100},
    {'id': str(uuid.uuid4()), 'name': 'Kedelai kuning 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 22000, 'unit': '1 kg', 'shelf_life': 180, 'stock': 120},
    {'id': str(uuid.uuid4()), 'name': 'Kacang tanah 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 30000, 'unit': '1 kg', 'shelf_life': 90, 'stock': 80},
    {'id': str(uuid.uuid4()), 'name': 'Kentang dieng 1 kg', 'category': 'Sayur', 'type': 'online', 'price': 25000, 'unit': '1 kg', 'shelf_life': 30, 'stock': 60},
    {'id': str(uuid.uuid4()), 'name': 'Singkong 1 kg', 'category': 'Sayur', 'type': 'online', 'price': 8000, 'unit': '1 kg', 'shelf_life': 5, 'stock': 70},
    {'id': str(uuid.uuid4()), 'name': 'Jagung manis 1 kg', 'category': 'Sayur', 'type': 'online', 'price': 18000, 'unit': '1 kg', 'shelf_life': 7, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Mie instant 1 karton', 'category': 'Bahan Kering', 'type': 'online', 'price': 75000, 'unit': '1 karton', 'shelf_life': 180, 'stock': 40},
    {'id': str(uuid.uuid4()), 'name': 'Minyak goreng 2L', 'category': 'Bahan Kering', 'type': 'online', 'price': 45000, 'unit': '2 L', 'shelf_life': 365, 'stock': 90},
    {'id': str(uuid.uuid4()), 'name': 'Gula pasir 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 18000, 'unit': '1 kg', 'shelf_life': 365, 'stock': 150},
    {'id': str(uuid.uuid4()), 'name': 'Gas LPG 3kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 22000, 'unit': '3 kg', 'shelf_life': 365, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Pisang cavendish 1 kg', 'category': 'Buah', 'type': 'online', 'price': 25000, 'unit': '1 kg', 'shelf_life': 7, 'stock': 60},
    {'id': str(uuid.uuid4()), 'name': 'Susu UHT 1 L', 'category': 'Bahan Kering', 'type': 'online', 'price': 18000, 'unit': '1 L', 'shelf_life': 180, 'stock': 80},
    {'id': str(uuid.uuid4()), 'name': 'Telur bebek 1 kg', 'category': 'Protein Telur', 'type': 'online', 'price': 38000, 'unit': '1 kg', 'shelf_life': 21, 'stock': 50},
    {'id': str(uuid.uuid4()), 'name': 'Telur omega 1 kg', 'category': 'Protein Telur', 'type': 'online', 'price': 42000, 'unit': '1 kg', 'shelf_life': 21, 'stock': 45},
    {'id': str(uuid.uuid4()), 'name': 'Daging kambing 500g', 'category': 'Protein Daging', 'type': 'online', 'price': 140000, 'unit': '500 g', 'shelf_life': 7, 'stock': 15},
    {'id': str(uuid.uuid4()), 'name': 'Tahu putih 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 12000, 'unit': '1 kg', 'shelf_life': 3, 'stock': 100},
    {'id': str(uuid.uuid4()), 'name': 'Tepung terigu 1 kg', 'category': 'Bahan Kering', 'type': 'online', 'price': 15000, 'unit': '1 kg', 'shelf_life': 180, 'stock': 120},
]

def save_products_csv():
    """Save products dengan UUID ke CSV"""
    output_path = Path(__file__).parent / 'raw' / 'products.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    fieldnames = ['id', 'name', 'category_id', 'category_name', 'product_type', 
                  'selling_price', 'quantity_info', 'shelf_life_days', 'total_stock',
                  'description', 'is_active', 'created_at']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for p in PRODUCTS:
            created_date = datetime.now() - timedelta(days=random.randint(1, 90))
            writer.writerow({
                'id': p['id'],
                'name': p['name'],
                'category_id': CATEGORIES[p['category']],
                'category_name': p['category'],
                'product_type': p['type'],
                'selling_price': p['price'],
                'quantity_info': p['unit'],
                'shelf_life_days': p['shelf_life'],
                'total_stock': p['stock'],
                'description': f"{p['name']} segar berkualitas tinggi",
                'is_active': True,
                'created_at': created_date.strftime('%Y-%m-%d %H:%M:%S')
            })
    
    print(f"✅ Generated {len(PRODUCTS)} products with UUID in {output_path}")
    return PRODUCTS

def save_customers_csv():
    """Generate customers dengan UUID"""
    output_path = Path(__file__).parent / 'raw' / 'customers.csv'
    
    fieldnames = ['id', 'phone_number', 'full_name', 'address', 'created_at']
    
    customers = []
    for i in range(1, 21):
        customer_id = str(uuid.uuid4())
        customers.append({
            'id': customer_id,
            'phone_number': f'08123456{i:04d}',
            'full_name': f'Customer {i}',
            'address': f'Jl. Contoh No. {i}, Jakarta',
            'created_at': (datetime.now() - timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d %H:%M:%S')
        })
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(customers)
    
    print(f"✅ Generated {len(customers)} customers with UUID in {output_path}")
    return customers

def save_orders_csv(products, customers):
    """Generate orders dengan UUID"""
    output_path = Path(__file__).parent / 'raw' / 'orders.csv'
    
    # Bundles untuk realistic co-occurrence
    bundles = {
        'seafood': [p['id'] for p in products if p['category'] == 'Protein Laut'][:5],
        'bumbu': [p['id'] for p in products if p['category'] == 'Bumbu'][:5],
        'ayam': [p['id'] for p in products if p['category'] == 'Protein Daging'][:4],
        'sayur': [p['id'] for p in products if p['category'] == 'Sayur'][:4],
        'buah': [p['id'] for p in products if p['category'] == 'Buah'][:3],
    }
    
    fieldnames = ['id', 'order_number', 'customer_id', 'product_id', 'quantity',
                  'unit_price', 'total_price', 'order_date', 'status']
    
    orders = []
    order_counter = 1
    
    for _ in range(500):
        order_id = str(uuid.uuid4())
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{order_counter:04d}"
        customer = random.choice(customers)
        order_date = datetime.now() - timedelta(days=random.randint(0, 90))
        status = random.choices(['completed', 'processing', 'cancelled'], weights=[0.95, 0.03, 0.02])[0]
        
        # 70% bundle orders, 30% random
        if random.random() < 0.7:
            bundle_type = random.choice(list(bundles.keys()))
            selected_products = random.sample(bundles[bundle_type], min(3, len(bundles[bundle_type])))
        else:
            selected_products = random.sample([p['id'] for p in products], random.randint(1, 5))
        
        for product_id in selected_products:
            product = next(p for p in products if p['id'] == product_id)
            quantity = random.randint(1, 5)
            unit_price = product['price']
            
            orders.append({
                'id': str(uuid.uuid4()),
                'order_number': order_number,
                'customer_id': customer['id'],
                'product_id': product_id,
                'quantity': quantity,
                'unit_price': unit_price,
                'total_price': unit_price * quantity,
                'order_date': order_date.strftime('%Y-%m-%d %H:%M:%S'),
                'status': status
            })
        
        order_counter += 1
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(orders)
    
    print(f"✅ Generated {len(orders)} order items with UUID in {output_path}")
    print(f"   - Unique orders: {order_counter - 1}")
    print(f"   - Unique customers: {len(customers)}")

if __name__ == '__main__':
    print("🔄 Regenerating CSV data with UUID format...\n")
    
    products = save_products_csv()
    customers = save_customers_csv()
    save_orders_csv(products, customers)
    
    print("\n✅ All CSV files regenerated with UUID!")
    print("📝 UUID Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
