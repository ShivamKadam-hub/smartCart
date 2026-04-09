import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useCartStore, CartItem as CartItemType } from '../store/cartStore';
import { useSmartRecommendations } from '../hooks/useSmartRecommendations';
import { Bundle } from '../data/bundleRules';
import { Product } from '../data/mockProducts';
import CartItemComponent from '../components/CartItem';
import SmartBundleCard from '../components/SmartBundleCard';
import ComplementaryRow from '../components/ComplementaryRow';
import SavedForLaterSection from '../components/SavedForLaterSection';

export default function CartScreen() {
  /* ── state ── */
  const items = useCartStore((s) => s.items);
  const savedForLater = useCartStore((s) => s.savedForLater);
  const dismissedBundles = useCartStore((s) => s.dismissedBundles);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const addBundleItems = useCartStore((s) => s.addBundleItems);
  const dismissBundle = useCartStore((s) => s.dismissBundle);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getSavings = useCartStore((s) => s.getSavings);

  /* ── recommendations ── */
  const { bundles, complementary, savedForLater: saved } =
    useSmartRecommendations(items, savedForLater, dismissedBundles);

  /* ── computed ── */
  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);
  const savings = useMemo(() => getSavings(), [items, getSavings]);
  const total = subtotal - savings;
  const itemCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );

  /* ── callbacks ── */
  const handleIncrement = useCallback(
    (id: string) => updateQuantity(id, 1),
    [updateQuantity],
  );
  const handleDecrement = useCallback(
    (id: string) => updateQuantity(id, -1),
    [updateQuantity],
  );
  const handleRemove = useCallback(
    (id: string) => removeItem(id),
    [removeItem],
  );
  const handleSaveForLater = useCallback(
    (id: string) => saveForLater(id),
    [saveForLater],
  );
  const handleMoveToCart = useCallback(
    (id: string) => moveToCart(id),
    [moveToCart],
  );
  const handleAddComplementary = useCallback(
    (product: Product) => addItem(product),
    [addItem],
  );
  const handleAddBundle = useCallback(
    (bundle: Bundle) => {
      addBundleItems(bundle.products);
      dismissBundle(bundle.rule.id);
    },
    [addBundleItems, dismissBundle],
  );
  const handleDismissBundle = useCallback(
    (bundleId: string) => dismissBundle(bundleId),
    [dismissBundle],
  );

  /* ── render item ── */
  const renderCartItem = useCallback(
    ({ item }: { item: CartItemType }) => (
      <CartItemComponent
        item={item}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onSaveForLater={handleSaveForLater}
      />
    ),
    [handleIncrement, handleDecrement, handleRemove, handleSaveForLater],
  );

  /* ── empty state ── */
  if (items.length === 0 && saved.length === 0) {
    return (
      <SafeAreaView style={styles.emptyRoot}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Discover our premium collection and fill your cart with culinary
            essentials.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ── header / footer sections ── */
  const ListHeader = () => (
    <View>
      {/* Bundle offers */}
      {bundles.map((bundle) => (
        <SmartBundleCard
          key={bundle.rule.id}
          bundle={bundle}
          onAddBundle={handleAddBundle}
          onDismiss={handleDismissBundle}
        />
      ))}
    </View>
  );

  const ListFooter = () => (
    <View>
      {/* Complementary */}
      <ComplementaryRow
        products={complementary}
        onAdd={handleAddComplementary}
      />

      {/* Saved for later */}
      <SavedForLaterSection items={saved} onMoveToCart={handleMoveToCart} />

      {/* Order summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryHeading}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        {savings > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.savingsLabel}>Savings</Text>
            <Text style={styles.savingsValue}>-${savings.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Spacer so content isn't behind sticky button */}
      <View style={{ height: 90 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.headerCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
      </View>

      {/* ── cart list ── */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderCartItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* ── sticky checkout ── */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>${total.toFixed(2)}</Text>
          {savings > 0 && (
            <Text style={styles.checkoutSavings}>You save ${savings.toFixed(2)}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 0,
  },

  /* header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerCount: {
    fontSize: 14,
    color: '#8A7560',
    fontWeight: '500',
  },

  /* empty */
  emptyRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8A7560',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* summary */
  summary: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EDED',
  },
  summaryHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#555',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  savingsLabel: {
    fontSize: 15,
    color: '#2E7D32',
  },
  savingsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#8B1A1A',
  },

  /* checkout bar */
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E2DC',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 10,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutTotal: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  checkoutSavings: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
