import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const products = [
  {
    title: 'Marble Prep Board',
    price: '₹4,299',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=400',
  },
  {
    title: 'Copper Spice Rack',
    price: '₹2,199',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400',
  },
  {
    title: 'Minimal Cookware Set',
    price: '₹11,499',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=400',
  },
];

export default function KitchenCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoryTitle}>Kitchen</Text>
      <Text style={styles.categorySubtitle}>
        Curated cookware, tableware, and style-forward kitchen essentials.
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
