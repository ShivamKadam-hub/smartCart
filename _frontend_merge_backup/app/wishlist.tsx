import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';

import { useWishlist } from './context/WishlistContext';

export default function WishlistScreen() {
  const { items, removeFromWishlist } = useWishlist();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.subtitle}>
          {items.length > 0
            ? `You have ${items.length} item${items.length > 1 ? 's' : ''} saved.`
            : 'Your favorite items will appear here once you add them from the collection.'}
        </Text>
      </View>

      {items.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <View key={item.backendProductId || item.slug} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.cardInfo}>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => void removeFromWishlist(item.backendProductId || item.slug)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>
            Tap the wishlist button on a product to keep it here for later.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
  },
  cardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  removeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#000',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});
