import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Product } from '../data/mockProducts';

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
}

function ComplementaryItem({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  return (
    <View style={styles.itemCard}>
      <Image source={{ uri: product.image }} style={styles.itemImage} />
      <Text style={styles.itemName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.star}>★</Text>
        <Text style={styles.ratingText}>{product.rating}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAdd(product)}
        activeOpacity={0.8}
      >
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const MemoItem = React.memo(ComplementaryItem);

export default function ComplementaryRow({ products, onAdd }: Props) {
  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>You might also need</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MemoItem product={item} onAdd={onAdd} />}
      />
    </View>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 12,
    gap: 10,
  },
  itemCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0EDED',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
    height: 34,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B1A1A',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    color: '#E5A100',
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#8A7560',
  },
  addBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
