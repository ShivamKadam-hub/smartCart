import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const products = [
  {
    title: 'Woven Outdoor Chair',
    price: '₹9,499',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=400',
  },
  {
    title: 'Patio Lantern Set',
    price: '₹2,799',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400',
  },
  {
    title: 'Outdoor Cushion Bundle',
    price: '₹3,299',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400',
  },
];

export default function OutdoorCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoryTitle}>Outdoor</Text>
      <Text style={styles.categorySubtitle}>
        Refresh your patio with outdoor furniture and decor built for sunshine.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
        {products.map((item) => (
          <View style={styles.card} key={item.title}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardPrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 30, paddingHorizontal: 20 },
  categoryTitle: { fontSize: 34, fontWeight: '700', marginBottom: 10 },
  categorySubtitle: { fontSize: 16, color: '#666', marginBottom: 22, lineHeight: 22 },
  list: { paddingBottom: 20 },
  card: {
    width: 220,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  image: { width: '100%', height: 160 },
  cardTitle: { marginTop: 12, marginHorizontal: 12, fontSize: 16, fontWeight: '700' },
  cardPrice: { marginTop: 6, marginHorizontal: 12, marginBottom: 14, color: '#666' },
});
