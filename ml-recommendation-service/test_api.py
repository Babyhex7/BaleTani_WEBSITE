"""
Test ML API Endpoints
Run this while server is running
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("\n" + "="*70)
print("TESTING ML RECOMMENDATION API")
print("="*70)

# Test 1: Health Check
print("\n[1/4] Testing Health Endpoint...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"✓ Status: {response.status_code}")
    print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: Root Endpoint
print("\n[2/4] Testing Root Endpoint...")
try:
    response = requests.get(f"{BASE_URL}/", timeout=5)
    print(f"✓ Status: {response.status_code}")
    print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 3: Similar Products (using real product ID from CSV)
print("\n[3/4] Testing Similar Products...")
test_product_id = "7a4af2f2-f55b-4300-a4ba-4406efcc350c"  # Udang sedang
try:
    response = requests.get(
        f"{BASE_URL}/v1/recommendations/similar/{test_product_id}?top_k=5",
        timeout=10
    )
    print(f"✓ Status: {response.status_code}")
    data = response.json()
    print(f"✓ Found {len(data.get('recommendations', []))} recommendations")
    if data.get('recommendations'):
        print(f"  Top recommendation: {data['recommendations'][0].get('product_name', 'N/A')}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 4: Trending Products
print("\n[4/4] Testing Trending Products...")
try:
    response = requests.get(f"{BASE_URL}/v1/recommendations/trending?top_k=10", timeout=10)
    print(f"✓ Status: {response.status_code}")
    data = response.json()
    print(f"✓ Found {len(data.get('recommendations', []))} trending products")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*70)
print("TESTING COMPLETE")
print("="*70 + "\n")
