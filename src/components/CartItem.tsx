import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CartItem as CartItemType } from '../store/cartStore';

interface Props {
  item: CartItemType;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (id: string) => void;
}

function CartItemComponent({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onSaveForLater,
}: Props) {
  const { product, quantity } = item;

  const handleIncrement = useCallback(
    () => onIncrement(product.id),
    [onIncrement, product.id],
  );
  const handleDecrement = useCallback(
    () => onDecrement(product.id),
    [onDecrement, product.id],
  );
  const handleRemove = useCallback(
    () => onRemove(product.id),
    [onRemove, product.id],
  );
  const handleSave = useCallback(
    () => onSaveForLater(product.id),
    [onSaveForLater, product.id],
  );

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          ${product.price.toFixed(2)}
        </Text>

        {/* Quantity stepper */}
        <View style={styles.stepperRow}>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={styles.stepperBtn}
              accessibilityLabel="Decrease quantity"
            >
              <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.stepperBtn}
              accessibilityLabel="Increase quantity"
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRemove} style={styles.actionBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(CartItemComponent);

/* ─── styles ─── */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDED',
    height: 110,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B1A1A',
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D4CF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepperText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B1A1A',
  },
  qty: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#8B1A1A',
    fontWeight: '500',
  },
  removeText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});
