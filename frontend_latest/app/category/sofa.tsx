import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const products = [
  {
    title: 'Low-Profile Sofa',
    price: '₹18,999',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=400',
  },
  {
    title: 'Cloud Lounge Chair',
    price: '₹14,499',
    image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=400',
  },
  {
    title: 'Minimal Daybed',
    price: '₹21,799',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=400',
  },
];

export default function SofaCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoryTitle}>Sofa</Text>
      <Text style={styles.categorySubtitle}>
        Comfortable seating pieces designed for modern living rooms.
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
