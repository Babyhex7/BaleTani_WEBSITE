"""
Cache Manager - In-Memory Caching untuk Recommendations
Menggunakan dictionary dengan TTL (Time-To-Live) untuk caching results
"""
import time
from typing import Any, Optional, Dict
from loguru import logger
from datetime import datetime, timedelta


class CacheManager:
    """
    In-Memory Cache Manager dengan TTL support
    
    Features:
    - Simple key-value store
    - TTL (Time-To-Live) per entry
    - Auto cleanup expired entries
    - Cache statistics (hit rate, miss rate)
    """
    
    def __init__(self, ttl: int = 3600, max_size: int = 1000):
        """
        Initialize Cache Manager
        
        Args:
            ttl: Time-to-live dalam detik (default: 1 jam)
            max_size: Maximum number of entries (untuk prevent memory overflow)
        """
        self.ttl = ttl
        self.max_size = max_size
        
        # Cache storage: {key: {'value': data, 'expires_at': timestamp}}
        self._cache: Dict[str, Dict] = {}
        
        # Statistics
        self._hits = 0
        self._misses = 0
        self._evictions = 0
        
        logger.info(f"✅ CacheManager initialized (TTL: {ttl}s, Max Size: {max_size})")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value jika ada dan belum expired, None otherwise
        """
        # Check if key exists
        if key not in self._cache:
            self._misses += 1
            return None
        
        entry = self._cache[key]
        
        # Check if expired
        if time.time() > entry['expires_at']:
            # Remove expired entry
            del self._cache[key]
            self._misses += 1
            return None
        
        # Cache hit!
        self._hits += 1
        return entry['value']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """
        Store value in cache
        
        Args:
            key: Cache key
            value: Value to cache (bisa apa saja: dict, list, string, dll)
            ttl: Custom TTL untuk entry ini (optional, default pakai self.ttl)
        """
        # Check max size
        if len(self._cache) >= self.max_size:
            # Evict oldest entry (simple FIFO strategy)
            self._evict_oldest()
        
        # Calculate expiry time
        ttl_seconds = ttl if ttl is not None else self.ttl
        expires_at = time.time() + ttl_seconds
        
        # Store in cache
        self._cache[key] = {
            'value': value,
            'expires_at': expires_at,
            'created_at': time.time()
        }
    
    def delete(self, key: str) -> bool:
        """
        Delete specific cache entry
        
        Args:
            key: Cache key to delete
            
        Returns:
            True jika berhasil delete, False jika key tidak ada
        """
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self):
        """Clear all cache entries"""
        self._cache.clear()
        logger.info("🗑️ All cache cleared")
    
    def cleanup_expired(self):
        """
        Manual cleanup expired entries
        Biasanya dijalankan periodic (e.g., setiap 5 menit)
        """
        current_time = time.time()
        expired_keys = []
        
        for key, entry in self._cache.items():
            if current_time > entry['expires_at']:
                expired_keys.append(key)
        
        # Remove expired keys
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"🧹 Cleaned up {len(expired_keys)} expired cache entries")
    
    def _evict_oldest(self):
        """
        Evict oldest cache entry (FIFO)
        Dipanggil ketika cache penuh
        """
        if not self._cache:
            return
        
        # Find oldest entry
        oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k]['created_at'])
        
        # Delete it
        del self._cache[oldest_key]
        self._evictions += 1
        
        logger.warning(f"⚠️ Cache full, evicted oldest entry: {oldest_key}")
    
    def get_stats(self) -> Dict:
        """
        Get cache statistics
        
        Returns:
            Dict dengan cache stats (hit rate, miss rate, size, dll)
        """
        total_requests = self._hits + self._misses
        hit_rate = (self._hits / total_requests * 100) if total_requests > 0 else 0.0
        miss_rate = (self._misses / total_requests * 100) if total_requests > 0 else 0.0
        
        return {
            'cache_enabled': True,
            'total_entries': len(self._cache),
            'max_size': self.max_size,
            'ttl_seconds': self.ttl,
            'hits': self._hits,
            'misses': self._misses,
            'evictions': self._evictions,
            'total_requests': total_requests,
            'hit_rate_percent': round(hit_rate, 2),
            'miss_rate_percent': round(miss_rate, 2)
        }
    
    def reset_stats(self):
        """Reset statistics counters"""
        self._hits = 0
        self._misses = 0
        self._evictions = 0
        logger.info("📊 Cache statistics reset")
    
    def get_size_bytes(self) -> int:
        """
        Estimate cache size in bytes (rough estimate)
        
        Returns:
            Approximate size in bytes
        """
        import sys
        total_size = sys.getsizeof(self._cache)
        
        for key, entry in self._cache.items():
            total_size += sys.getsizeof(key)
            total_size += sys.getsizeof(entry)
            total_size += sys.getsizeof(entry['value'])
        
        return total_size
    
    def get_ttl_remaining(self, key: str) -> Optional[int]:
        """
        Get remaining TTL for a key
        
        Args:
            key: Cache key
            
        Returns:
            Remaining seconds, atau None jika key tidak ada/expired
        """
        if key not in self._cache:
            return None
        
        entry = self._cache[key]
        remaining = int(entry['expires_at'] - time.time())
        
        return remaining if remaining > 0 else None


# ===== REDIS CACHE MANAGER (OPTIONAL, untuk production) =====
class RedisCacheManager:
    """
    Redis-based Cache Manager (untuk production dengan multiple servers)
    
    NOTE: Ini optional, perlu install redis-py:
    pip install redis
    """
    
    def __init__(self, host: str = 'localhost', port: int = 6379, ttl: int = 3600):
        """
        Initialize Redis Cache Manager
        
        Args:
            host: Redis host
            port: Redis port
            ttl: Default TTL dalam detik
        """
        try:
            import redis
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                decode_responses=True
            )
            self.ttl = ttl
            self.redis_client.ping()  # Test connection
            logger.info(f"✅ Redis connected at {host}:{port}")
        except ImportError:
            logger.error("❌ redis-py not installed. Install: pip install redis")
            raise
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from Redis"""
        import json
        value = self.redis_client.get(key)
        if value is None:
            return None
        return json.loads(value)
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in Redis with TTL"""
        import json
        ttl_seconds = ttl if ttl is not None else self.ttl
        self.redis_client.setex(key, ttl_seconds, json.dumps(value))
    
    def delete(self, key: str):
        """Delete key from Redis"""
        self.redis_client.delete(key)
    
    def clear(self):
        """Clear all keys (DANGEROUS!)"""
        self.redis_client.flushdb()
    
    def get_stats(self) -> Dict:
        """Get Redis stats"""
        info = self.redis_client.info('stats')
        return {
            'cache_enabled': True,
            'cache_type': 'redis',
            'total_connections': info.get('total_connections_received', 0),
            'total_commands': info.get('total_commands_processed', 0),
            'keyspace_hits': info.get('keyspace_hits', 0),
            'keyspace_misses': info.get('keyspace_misses', 0)
        }


if __name__ == "__main__":
    # Test cache manager
    logger.info("=" * 60)
    logger.info("Testing Cache Manager")
    logger.info("=" * 60)
    
    # Initialize
    cache = CacheManager(ttl=5)  # 5 seconds TTL untuk testing
    
    # Test 1: Set and Get
    logger.info("\n[TEST 1] Set and Get")
    cache.set('key1', {'product': 'Udang', 'price': 50000})
    result = cache.get('key1')
    logger.info(f"✅ Retrieved: {result}")
    
    # Test 2: Cache miss
    logger.info("\n[TEST 2] Cache Miss")
    result = cache.get('non_existent_key')
    logger.info(f"Result: {result} (should be None)")
    
    # Test 3: TTL expiration
    logger.info("\n[TEST 3] TTL Expiration")
    cache.set('key2', 'will expire soon', ttl=2)
    logger.info("Waiting 3 seconds...")
    time.sleep(3)
    result = cache.get('key2')
    logger.info(f"Result after expiry: {result} (should be None)")
    
    # Test 4: Statistics
    logger.info("\n[TEST 4] Cache Statistics")
    stats = cache.get_stats()
    logger.info(f"Stats: {stats}")
    
    # Test 5: Size estimate
    logger.info("\n[TEST 5] Cache Size")
    for i in range(10):
        cache.set(f'key_{i}', {'data': f'value_{i}'})
    size_bytes = cache.get_size_bytes()
    logger.info(f"Cache size: {size_bytes} bytes (~{size_bytes/1024:.2f} KB)")
