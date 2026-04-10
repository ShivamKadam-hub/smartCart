import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { RecommendationStrip } from '@/components/recommendation-strip';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getMlRecommendations, getProductBySlug, type ProductRecord } from '@/lib/api';

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString('en-IN')}`;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const productSlug = typeof slug === 'string' ? slug : undefined;
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        if (!productSlug) {
          if (mounted) {
            setLoadError('Product not found.');
            setIsLoading(false);
          }
          return;
        }

        const response = await getProductBySlug(productSlug);
        if (mounted) {
          setProducts([response.data]);
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
  }, [productSlug]);

  const product = products[0];
  const wishlisted = productSlug ? isWishlisted(productSlug) : false;
  const productImages =
    product?.images?.filter((image) => Boolean(image?.url))?.length
      ? product.images.filter((image) => Boolean(image?.url))
      : product?.imageUrl
        ? [{ url: product.imageUrl }]
        : [];
  const selectedImage = productImages[selectedImageIndex]?.url || productImages[0]?.url || '';

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      if (!product) {
        setRecommendedProducts([]);
        return;
      }

      try {
        setRecommendationLoading(true);
        const response = await getMlRecommendations({
          cartItems: [
            {
              name: product.name,
              description: product.description,
              price: product.price,
              label: product.category,
              category: product.category,
              backendProductId: product.id,
            },
          ],
          text: `${product.name} recommendations`,
          topK: 4,
        });

        if (mounted) {
          setRecommendedProducts(response.data);
        }
      } catch {
        if (mounted) {
          setRecommendedProducts([]);
        }
      } finally {
        if (mounted) {
          setRecommendationLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      mounted = false;
    };
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || addedToCart) {
      return;
    }

    await addToCart({
      id: product.id,
      backendProductId: product.id,
      name: product.name,
      description: product.description || `${product.category} product`,
      price: product.price,
      img: product.imageUrl,
      label: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const openCheckout = () => {
    if (!product) {
      return;
    }

    router.push({
      pathname: '/checkout',
      params: { product: product.name },
    } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Loading product...</Text>
            <Text style={styles.description}>Fetching the latest product data from backend.</Text>
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Unable to load product</Text>
            <Text style={styles.description}>{loadError}</Text>
          </View>
        ) : product ? (
          <>
            {selectedImage ? (
              <View style={styles.gallery}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                {productImages.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailRow}>
                    {productImages.map((image, index) => {
                      const isActive = index === selectedImageIndex;
                      return (
                        <TouchableOpacity
                          key={`${image.url}-${index}`}
                          style={[styles.thumbnailButton, isActive && styles.thumbnailButtonActive]}
                          onPress={() => setSelectedImageIndex(index)}>
                          <Image source={{ uri: image.url }} style={styles.thumbnailImage} />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>
            ) : null}

            <View style={styles.info}>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>{product.brand || 'Backend catalog'}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>{product.category}</Text>
                </View>
              </View>
              <Text style={styles.description}>{product.description}</Text>
              <View style={styles.detailRow}>
                <Ionicons name="cube-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </Text>
              </View>
              {product.tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {product.tags.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.wishlistButton, wishlisted && styles.wishlistedButton]}
                  onPress={() =>
                    void toggleWishlist({
                      slug: productSlug ?? '',
                      title: product.name,
                      price: formatPrice(product.price),
                      image: product.imageUrl,
                      description: product.description,
                      backendProductId: product.id,
                    })
                  }>
                  <Text
                    style={[
                      styles.wishlistButtonText,
                      wishlisted && styles.wishlistedButtonTextActive,
                    ]}>
                    {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cartButton, addedToCart && styles.cartButtonAdded]}
                  onPress={() => void handleAddToCart()}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={addedToCart ? 'checkmark-circle' : 'bag-add-outline'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.buyButtonText}>
                    {addedToCart ? 'Added to Cart' : 'Add to Cart'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={openCheckout}>
                <Text style={styles.checkoutButtonText}>Buy Now</Text>
              </TouchableOpacity>

              <RecommendationStrip
                title="More like this"
                items={recommendedProducts.length > 0 ? recommendedProducts : products}
                loading={recommendationLoading}
                loadingText="Finding similar picks..."
                actionLabel="Add"
                onAction={async (item) => {
                  await addToCart({
                    id: item.id,
                    backendProductId: item.id,
                    name: item.name,
                    description: item.description || `${item.category} product`,
                    price: item.price,
                    img: item.imageUrl,
                    label: item.category,
                  });
                }}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Product not found</Text>
            <Text style={styles.description}>
              Sorry, we couldn't find that item. Try selecting another product from the home screen.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  gallery: {
    gap: 12,
  },
  image: {
    width: '100%',
    height: 320,
  },
  thumbnailRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  thumbnailButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E3DB',
    padding: 3,
    backgroundColor: '#fff',
  },
  thumbnailButtonActive: {
    borderColor: '#AF9461',
  },
  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  info: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metaPill: {
    backgroundColor: '#F3F3F3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tagPill: {
    backgroundColor: '#F9F9F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  wishlistButton: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  wishlistButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  wishlistedButtonTextActive: {
    color: '#fff',
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cartButtonAdded: {
    backgroundColor: '#AF9461',
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  wishlistedButton: {
    backgroundColor: '#000',
  },
  checkoutButton: {
    backgroundColor: '#AF9461',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});
