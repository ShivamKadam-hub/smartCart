import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CartItem } from '../store/cartStore';

interface Props {
  items: CartItem[];
  onMoveToCart: (id: string) => void;
}

export default function SavedForLaterSection({ items, onMoveToCart }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved for Later ({items.length})</Text>

      {items.map((item) => (
        <View key={item.product.id} style={styles.row}>
          <Image
            source={{ uri: item.product.image }}
            style={styles.image}
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text style={styles.price}>
              ${item.product.price.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moveBtn}
            onPress={() => onMoveToCart(item.product.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.moveBtnText}>Move to Cart</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0EDED',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B1A1A',
  },
  moveBtn: {
    borderWidth: 1.5,
    borderColor: '#8B1A1A',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  moveBtnText: {
    color: '#8B1A1A',
    fontSize: 13,
    fontWeight: '700',
  },
});
