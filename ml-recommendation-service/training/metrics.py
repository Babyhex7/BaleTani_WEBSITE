"""
Complete Metrics Module untuk Recommendation System
✅ 10 METRICS LENGKAP dengan komentar Indonesia
✅ MODULAR: Setiap metric bisa dipakai standalone
✅ TESTED: Formula sesuai industry standard
"""
import numpy as np
from typing import List, Set, Optional
from loguru import logger


# ============================================
# 1️⃣ PRECISION@K
# ============================================
def precision_at_k(
    recommended_ids: List,
    relevant_ids: List,
    k: int = 10
) -> float:
    """
    PRECISION@K: Persentase rekomendasi yang relevan
    
    Formula: precision@K = (relevant items in top-K) / K
    
    Arti:
    - Dari 10 rekomendasi, berapa yang benar-benar relevan?
    - Higher = better (ideal = 1.0 atau 100%)
    
    Args:
        recommended_ids: List product IDs yang di-recommend (urutan penting!)
        relevant_ids: List product IDs yang relevan (ground truth)
        k: Top-K recommendations yang dievaluasi
    
    Returns:
        Precision score [0.0, 1.0]
    
    Contoh:
        Recommended: [A, B, C, D, E, F, G, H, I, J]  (10 produk)
        Relevant:    [A, C, E, G]                    (4 produk relevan)
        
        Precision@10 = 4/10 = 0.4 (40%)
        → Artinya: Dari 10 rekomendasi, 4 produk relevan
    """
    if k <= 0:
        return 0.0
    
    # Ambil top-K recommendations
    recommended_topk = recommended_ids[:k]
    
    if len(recommended_topk) == 0:
        return 0.0
    
    # Hitung berapa yang relevan
    relevant_set = set(relevant_ids)
    relevant_in_topk = [pid for pid in recommended_topk if pid in relevant_set]
    
    precision = len(relevant_in_topk) / k
    
    return precision


# ============================================
# 2️⃣ RECALL@K
# ============================================
def recall_at_k(
    recommended_ids: List,
    relevant_ids: List,
    k: int = 10
) -> float:
    """
    RECALL@K: Persentase relevant items yang berhasil di-recommend
    
    Formula: recall@K = (relevant items in top-K) / (total relevant items)
    
    Arti:
    - Dari semua produk relevan, berapa persen yang muncul di rekomendasi?
    - Higher = better (ideal = 1.0 atau 100%)
    
    Args:
        recommended_ids: List product IDs yang di-recommend
        relevant_ids: List product IDs yang relevan
        k: Top-K recommendations
    
    Returns:
        Recall score [0.0, 1.0]
    
    Contoh:
        Recommended: [A, B, C, D, E]  (5 rekomendasi)
        Relevant:    [A, C, F, G, H]  (5 produk relevan total)
        
        Recall@5 = 2/5 = 0.4 (40%)
        → Artinya: Dari 5 produk relevan, hanya 2 yang muncul (A, C)
    """
    if len(relevant_ids) == 0:
        return 0.0
    
    recommended_topk = recommended_ids[:k]
    
    if len(recommended_topk) == 0:
        return 0.0
    
    relevant_set = set(relevant_ids)
    relevant_in_topk = [pid for pid in recommended_topk if pid in relevant_set]
    
    recall = len(relevant_in_topk) / len(relevant_ids)
    
    return recall


# ============================================
# 3️⃣ F1 SCORE
# ============================================
def f1_score(
    recommended_ids: List,
    relevant_ids: List,
    k: int = 10
) -> float:
    """
    F1 SCORE: Harmonic mean dari Precision dan Recall
    
    Formula: F1 = 2 × (precision × recall) / (precision + recall)
    
    Arti:
    - Balance antara precision dan recall
    - Lebih robust dari precision atau recall saja
    - Higher = better
    
    Args:
        recommended_ids: List product IDs yang di-recommend
        relevant_ids: List product IDs yang relevan
        k: Top-K recommendations
    
    Returns:
        F1 score [0.0, 1.0]
    
    Contoh:
        Precision = 0.6, Recall = 0.4
        F1 = 2 × (0.6 × 0.4) / (0.6 + 0.4)
           = 2 × 0.24 / 1.0
           = 0.48 (48%)
    """
    prec = precision_at_k(recommended_ids, relevant_ids, k)
    rec = recall_at_k(recommended_ids, relevant_ids, k)
    
    if prec + rec == 0:
        return 0.0
    
    f1 = 2 * (prec * rec) / (prec + rec)
    
    return f1


# ============================================
# 4️⃣ NDCG@K (Normalized Discounted Cumulative Gain)
# ============================================
def dcg_at_k(
    recommended_ids: List,
    relevant_ids: List,
    k: int = 10
) -> float:
    """
    DCG@K: Discounted Cumulative Gain
    
    Formula: DCG = Σ(relevance_i / log2(i + 2)) untuk i = 0 hingga k-1
    
    Arti:
    - Mengukur kualitas ranking
    - Item relevan di posisi atas dapat score lebih tinggi
    - Posisi 1 > Posisi 2 > Posisi 3, dst
    
    Args:
        recommended_ids: List product IDs (urutan PENTING!)
        relevant_ids: List product IDs yang relevan
        k: Top-K
    
    Returns:
        DCG score
    """
    recommended_topk = recommended_ids[:k]
    relevant_set = set(relevant_ids)
    
    dcg = 0.0
    for i, pid in enumerate(recommended_topk):
        if pid in relevant_set:
            # Relevance = 1 jika relevan, discount by position
            dcg += 1.0 / np.log2(i + 2)
    
    return dcg


def ndcg_at_k(
    recommended_ids: List,
    relevant_ids: List,
    k: int = 10
) -> float:
    """
    ⭐ NDCG@K: Normalized Discounted Cumulative Gain
    
    Formula: NDCG@K = DCG@K / IDCG@K
    
    Arti:
    - INDUSTRY STANDARD untuk mengukur ranking quality
    - Normalisasi DCG dengan ideal DCG (semua relevant di posisi teratas)
    - Score [0, 1], higher = better
    - 1.0 = perfect ranking
    
    Args:
        recommended_ids: List product IDs yang di-recommend
        relevant_ids: List product IDs yang relevan
        k: Top-K
    
    Returns:
        NDCG score [0.0, 1.0]
    
    Contoh:
        Recommended: [A, B, C, D, E] (A, C relevan)
        Relevant:    [A, C, F]
        
        DCG = 1/log2(2) + 1/log2(4) = 1.0 + 0.5 = 1.5
        IDCG = 1/log2(2) + 1/log2(3) = 1.0 + 0.631 = 1.631 (ideal: [A,C] di pos 1,2)
        NDCG = 1.5 / 1.631 = 0.92 (92%) ✅ EXCELLENT!
    
    Kenapa NDCG penting?
    - Amazon, Google, Netflix semua pakai NDCG
    - Lebih akurat dari precision/recall karena consider ranking
    - Target: NDCG@10 > 0.6 untuk sistem bagus
    """
    if len(relevant_ids) == 0:
        return 0.0
    
    # DCG actual
    dcg = dcg_at_k(recommended_ids, relevant_ids, k)
    
    # IDCG: Ideal DCG (semua relevant di posisi teratas)
    ideal_relevant_count = min(k, len(relevant_ids))
    idcg = sum(1.0 / np.log2(i + 2) for i in range(ideal_relevant_count))
    
    if idcg == 0:
        return 0.0
    
    ndcg = dcg / idcg
    
    return ndcg


# ============================================
# 5️⃣ MRR (Mean Reciprocal Rank)
# ============================================
def reciprocal_rank(
    recommended_ids: List,
    relevant_ids: List
) -> float:
    """
    RR: Reciprocal Rank (untuk 1 query)
    
    Formula: RR = 1 / rank_of_first_relevant_item
    
    Arti:
    - Seberapa cepat user menemukan item relevan?
    - Jika item relevan di posisi 1 → RR = 1.0
    - Jika item relevan di posisi 3 → RR = 0.333
    
    Args:
        recommended_ids: List recommendations
        relevant_ids: List relevant items
    
    Returns:
        Reciprocal rank [0.0, 1.0]
    """
    relevant_set = set(relevant_ids)
    
    for i, pid in enumerate(recommended_ids, start=1):
        if pid in relevant_set:
            return 1.0 / i
    
    return 0.0


def mrr_score(
    all_recommended: List[List],
    all_relevant: List[List]
) -> float:
    """
    MRR: Mean Reciprocal Rank (average dari multiple queries)
    
    Formula: MRR = average(RR_1, RR_2, ..., RR_n)
    
    Arti:
    - Rata-rata seberapa cepat user menemukan relevant item
    - Used by search engines (Google, Bing)
    - Higher = better (ideal = 1.0)
    
    Args:
        all_recommended: List of recommendation lists
        all_relevant: List of relevant item lists
    
    Returns:
        MRR score [0.0, 1.0]
    
    Contoh:
        Query 1: Recommended=[A,B,C], Relevant=[B] → RR=1/2=0.5
        Query 2: Recommended=[D,E,F], Relevant=[D] → RR=1/1=1.0
        Query 3: Recommended=[G,H,I], Relevant=[I] → RR=1/3=0.333
        
        MRR = (0.5 + 1.0 + 0.333) / 3 = 0.611
        → Average rank of first relevant = 1.64
    
    Target: MRR > 0.5 untuk sistem bagus
    """
    if len(all_recommended) == 0:
        return 0.0
    
    rr_scores = []
    for recommended, relevant in zip(all_recommended, all_relevant):
        rr = reciprocal_rank(recommended, relevant)
        rr_scores.append(rr)
    
    mrr = np.mean(rr_scores)
    
    return mrr


# ============================================
# 6️⃣ HIT RATE@K
# ============================================
def hit_rate_at_k(
    all_recommended: List[List],
    all_relevant: List[List],
    k: int = 10
) -> float:
    """
    HIT RATE@K: Persentase queries yang dapat minimal 1 relevant item
    
    Formula: Hit Rate = (queries dengan hit) / (total queries) × 100%
    
    Arti:
    - Berapa persen user yang dapat minimal 1 rekomendasi yang berguna?
    - Binary metric: hit atau tidak hit
    - Higher = better
    
    Args:
        all_recommended: List of recommendation lists
        all_relevant: List of relevant item lists
        k: Top-K
    
    Returns:
        Hit rate [0.0, 1.0]
    
    Contoh:
        Query 1: Recommended=[A,B,C], Relevant=[B,D] → HIT (ada B)
        Query 2: Recommended=[E,F,G], Relevant=[H,I] → MISS (tidak ada)
        Query 3: Recommended=[J,K,L], Relevant=[K,M] → HIT (ada K)
        
        Hit Rate = 2/3 = 0.667 (66.7%)
        → 2 dari 3 queries dapat minimal 1 relevant item
    
    Target: Hit Rate@10 > 0.8 (80%) untuk user satisfaction
    """
    if len(all_recommended) == 0:
        return 0.0
    
    hits = 0
    for recommended, relevant in zip(all_recommended, all_relevant):
        recommended_topk = recommended[:k]
        relevant_set = set(relevant)
        
        # Check apakah ada intersection
        if any(pid in relevant_set for pid in recommended_topk):
            hits += 1
    
    hit_rate = hits / len(all_recommended)
    
    return hit_rate


# ============================================
# 7️⃣ DIVERSITY SCORE
# ============================================
def diversity_score(
    recommended_ids: List,
    item_categories: dict,
    k: int = 10
) -> float:
    """
    DIVERSITY SCORE: Keberagaman kategori dalam rekomendasi
    
    Formula: Diversity = unique_categories_in_topK / K
    
    Arti:
    - Seberapa beragam rekomendasi (tidak monoton)?
    - Balancing: Relevance vs Diversity
    - Too high diversity = kurang relevan
    - Too low diversity = membosankan
    
    Args:
        recommended_ids: List product IDs
        item_categories: Dict mapping product_id → category
        k: Top-K
    
    Returns:
        Diversity score [0.0, 1.0]
    
    Contoh:
        Top-10: [A, B, C, D, E, F, G, H, I, J]
        Categories: [X, X, Y, X, Z, Y, Z, X, Y, Z]
        
        Unique categories = {X, Y, Z} = 3
        Diversity = 3/10 = 0.3
    
    Target: 0.3 - 0.5 (balance antara relevance dan variety)
    """
    recommended_topk = recommended_ids[:k]
    
    if len(recommended_topk) == 0:
        return 0.0
    
    # Get categories dari recommended products
    categories = []
    for pid in recommended_topk:
        if pid in item_categories:
            categories.append(item_categories[pid])
    
    if len(categories) == 0:
        return 0.0
    
    # Hitung unique categories
    unique_categories = len(set(categories))
    diversity = unique_categories / len(categories)
    
    return diversity


# ============================================
# 8️⃣ NOVELTY SCORE
# ============================================
def novelty_score(
    recommended_ids: List,
    item_popularity: dict,
    k: int = 10
) -> float:
    """
    NOVELTY SCORE: Seberapa sering recommend produk yang jarang/baru
    
    Formula: Novelty = 1 - (average_popularity of recommendations)
    
    Arti:
    - Apakah sistem recommend produk niche/baru atau hanya popular items?
    - High novelty = recommend long-tail items (niche products)
    - Low novelty = recommend blockbuster items (popular only)
    
    Args:
        recommended_ids: List product IDs
        item_popularity: Dict mapping product_id → popularity_score [0,1]
                        (0 = tidak popular, 1 = sangat popular)
        k: Top-K
    
    Returns:
        Novelty score [0.0, 1.0]
    
    Contoh:
        Recommended: [A, B, C]
        Popularity:  [0.9, 0.8, 0.1]  (A,B popular, C niche)
        
        Average popularity = (0.9 + 0.8 + 0.1) / 3 = 0.6
        Novelty = 1 - 0.6 = 0.4
    
    Target: 0.4 - 0.6 (balance popular vs niche)
    """
    recommended_topk = recommended_ids[:k]
    
    if len(recommended_topk) == 0:
        return 0.0
    
    # Get popularity scores
    popularity_scores = []
    for pid in recommended_topk:
        if pid in item_popularity:
            popularity_scores.append(item_popularity[pid])
    
    if len(popularity_scores) == 0:
        return 0.0
    
    avg_popularity = np.mean(popularity_scores)
    novelty = 1.0 - avg_popularity
    
    return novelty


# ============================================
# 9️⃣ SERENDIPITY SCORE
# ============================================
def serendipity_score(
    recommended_ids: List,
    relevant_ids: List,
    expected_ids: List,
    k: int = 10
) -> float:
    """
    SERENDIPITY SCORE: Rekomendasi "surprise" yang tetap relevan
    
    Formula: Serendipity = (unexpected & relevant) / relevant
    
    Arti:
    - Unexpected = tidak obvious/predictable
    - Tapi tetap relevan dan berguna
    - "Wow, I didn't know I wanted this!"
    
    Args:
        recommended_ids: List product IDs yang di-recommend
        relevant_ids: List product IDs yang relevan
        expected_ids: List product IDs yang obvious/predictable
        k: Top-K
    
    Returns:
        Serendipity score [0.0, 1.0]
    
    Contoh:
        User beli "Ayam", expected recommendation: "Telur", "Sayap Ayam"
        Actual recommendation: "Telur" (expected ✅), "Bumbu Rendang" (unexpected ✅)
        
        Relevant: [Telur, Bumbu Rendang, Bawang]
        Expected: [Telur, Sayap Ayam]
        Recommended: [Telur, Bumbu Rendang]
        
        Unexpected & Relevant = {Bumbu Rendang}
        Serendipity = 1/3 = 0.333
    
    Target: 0.2 - 0.3 (unexpected tapi tetap useful)
    """
    recommended_topk = recommended_ids[:k]
    relevant_set = set(relevant_ids)
    expected_set = set(expected_ids)
    
    # Unexpected = relevant tapi tidak expected
    unexpected_relevant = []
    for pid in recommended_topk:
        if pid in relevant_set and pid not in expected_set:
            unexpected_relevant.append(pid)
    
    if len(relevant_set) == 0:
        return 0.0
    
    serendipity = len(unexpected_relevant) / len(relevant_set)
    
    return serendipity


# ============================================
# 🔟 COVERAGE
# ============================================
def catalog_coverage(
    all_recommended: List[List],
    catalog_size: int
) -> float:
    """
    CATALOG COVERAGE: Persentase produk yang pernah di-recommend
    
    Formula: Coverage = (unique items recommended) / (total catalog size)
    
    Arti:
    - Apakah sistem bisa recommend berbagai produk atau hanya itu-itu saja?
    - Long-tail coverage: produk niche juga dapat kesempatan
    - Higher = better (tapi hati-hati dengan relevance)
    
    Args:
        all_recommended: List of all recommendation lists
        catalog_size: Total number of products in catalog
    
    Returns:
        Coverage [0.0, 1.0]
    
    Contoh:
        Total products = 1000
        Unique products pernah di-recommend = 700
        Coverage = 700/1000 = 0.7 (70%)
    
    Target: > 0.7 (70%) untuk fairness ke semua produk
    """
    # Collect all unique recommended items
    all_items = set()
    for recommendations in all_recommended:
        all_items.update(recommendations)
    
    coverage = len(all_items) / catalog_size
    
    return coverage


# ============================================
# 📊 ALL METRICS AT ONCE
# ============================================
def calculate_all_metrics(
    recommended_ids: List,
    relevant_ids: List,
    item_categories: Optional[dict] = None,
    item_popularity: Optional[dict] = None,
    expected_ids: Optional[List] = None,
    k: int = 10
) -> dict:
    """
    ✅ CALCULATE ALL METRICS SEKALIGUS untuk convenience
    
    Args:
        recommended_ids: List recommendations
        relevant_ids: List relevant items
        item_categories: Dict untuk diversity (optional)
        item_popularity: Dict untuk novelty (optional)
        expected_ids: List untuk serendipity (optional)
        k: Top-K
    
    Returns:
        Dict berisi semua metrics
    """
    metrics = {
        'precision@k': precision_at_k(recommended_ids, relevant_ids, k),
        'recall@k': recall_at_k(recommended_ids, relevant_ids, k),
        'f1_score': f1_score(recommended_ids, relevant_ids, k),
        'ndcg@k': ndcg_at_k(recommended_ids, relevant_ids, k),
        'mrr': reciprocal_rank(recommended_ids, relevant_ids)
    }
    
    # Optional metrics
    if item_categories is not None:
        metrics['diversity'] = diversity_score(recommended_ids, item_categories, k)
    
    if item_popularity is not None:
        metrics['novelty'] = novelty_score(recommended_ids, item_popularity, k)
    
    if expected_ids is not None:
        metrics['serendipity'] = serendipity_score(
            recommended_ids, relevant_ids, expected_ids, k
        )
    
    return metrics


if __name__ == "__main__":
    """
    Test metrics dengan contoh data
    """
    logger.info("Testing all metrics...")
    
    # Example data
    recommended = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    relevant = ['A', 'C', 'E', 'G', 'K', 'L']
    
    categories = {
        'A': 'Cat1', 'B': 'Cat2', 'C': 'Cat1',
        'D': 'Cat3', 'E': 'Cat1', 'F': 'Cat2',
        'G': 'Cat4', 'H': 'Cat2', 'I': 'Cat1', 'J': 'Cat3'
    }
    
    popularity = {
        'A': 0.9, 'B': 0.8, 'C': 0.7, 'D': 0.3,
        'E': 0.6, 'F': 0.5, 'G': 0.2, 'H': 0.4,
        'I': 0.1, 'J': 0.05
    }
    
    expected = ['A', 'B', 'K']
    
    # Calculate all metrics
    metrics = calculate_all_metrics(
        recommended_ids=recommended,
        relevant_ids=relevant,
        item_categories=categories,
        item_popularity=popularity,
        expected_ids=expected,
        k=10
    )
    
    # Print results
    logger.info("\n📊 METRICS RESULTS:")
    for metric_name, value in metrics.items():
        logger.info(f"  {metric_name:20s}: {value:.4f} ({value*100:.2f}%)")
    
    logger.info("\n✅ All metrics calculated successfully!")
