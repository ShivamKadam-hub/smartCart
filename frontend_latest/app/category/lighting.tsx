import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const products = [
  {
    title: 'Glass Pendant Lamp',
    price: '₹6,499',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400',
  },
  {
    title: 'Folded Paper Sconce',
    price: '₹3,299',
    image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=400',
  },
  {
    title: 'LED Floor Light',
    price: '₹7,899',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=400',
  },
];

export default function LightingCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoryTitle}>Lighting</Text>
      <Text style={styles.categorySubtitle}>
        Brighten every room with lighting that blends style and warmth.
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
