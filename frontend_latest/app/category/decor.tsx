import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const products = [
  {
    title: 'Woven Table Runner',
    price: '₹1,799',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=400',
  },
  {
    title: 'Ceramic Planter',
    price: '₹1,299',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=400',
  },
  {
    title: 'Framed Wall Art',
    price: '₹3,499',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400',
  },
];

export default function DecorCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoryTitle}>Decor</Text>
      <Text style={styles.categorySubtitle}>
        Accents and accessories designed to complete your living space.
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
