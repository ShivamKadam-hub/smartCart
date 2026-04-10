import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProducts, type ProductRecord } from '@/lib/api';

type CategoryCollectionProps = {
  slug: string;
  title?: string;
  description?: string;
};

const COLORS = {
  bg: '#F6F5F1',
  white: '#FFFFFF',
  gold: '#AF9461',
  goldSoft: 'rgba(175,148,97,0.12)',
  black: '#161616',
  textSecondary: '#7B7B75',
  border: 'rgba(0,0,0,0.06)',
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatCategoryTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString('en-IN')}`;
}

export function CategoryCollection({ slug, title, description }: CategoryCollectionProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const normalizedSlug = normalizeSlug(slug);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await getProducts({ category: normalizedSlug });
        if (mounted) {
          setProducts(response.data);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load products.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const visibleProducts = useMemo(
    () => products.filter((item) => normalizeSlug(item.category || '') === normalizedSlug),
    [products, normalizedSlug]
  );

  const heading = title ?? formatCategoryTitle(slug);
  const intro =
    description ?? `Browse ${heading.toLowerCase()} pieces fetched from the backend catalog.`;

  const handleAddToCart = async (item: ProductRecord) => {
    await addToCart({
      id: item.id,
      backendProductId: item.id,
      name: item.name,
      description: item.description || `${item.category} product`,
      price: item.price,
      img: item.imageUrl,
      label: item.category,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.subtitle}>{intro}</Text>
      </View>

      {isLoading && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>Loading products from backend...</Text>
        </View>
      )}

      {!!loadError && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{loadError}</Text>
        </View>
      )}

      {!isLoading && !loadError && visibleProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyText}>
            We could not find any backend products mapped to this category yet.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {visibleProducts.map((item) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.slug}` as never)}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </TouchableOpacity>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {item.brand || item.category}
              </Text>
              <TouchableOpacity
                style={[styles.heartButton, isWishlisted(item.slug) && styles.heartButtonActive]}
                onPress={() =>
                  void toggleWishlist({
                    slug: item.slug,
                    title: item.name,
                    price: formatPrice(item.price),
                    image: item.imageUrl,
                    description: item.description || item.name,
                    backendProductId: item.id,
                  })
                }
                activeOpacity={0.85}>
                <Ionicons
                  name={isWishlisted(item.slug) ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isWishlisted(item.slug) ? '#fff' : COLORS.black}
                />
              </TouchableOpacity>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                  {item.compareAtPrice ? (
                    <Text style={styles.cardCompare}>{formatPrice(item.compareAtPrice)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => void handleAddToCart(item)}
                  activeOpacity={0.85}>
                  <Ionicons name="add" size={16} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
    flexGrow: 1,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  statusBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  emptyState: {
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 220,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 22,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  heartButtonActive: {
    backgroundColor: '#000',
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.black,
  },
  cardCompare: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.goldSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
