import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Bundle } from '../data/bundleRules';

interface Props {
  bundle: Bundle;
  onAddBundle: (bundle: Bundle) => void;
  onDismiss: (bundleId: string) => void;
}

export default function SmartBundleCard({
  bundle,
  onAddBundle,
  onDismiss,
}: Props) {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(bundle.rule.id));
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      {/* dismiss "×" */}
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={handleDismiss}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.sparkle}>✨</Text>
      <Text style={styles.title}>{bundle.rule.label}</Text>
      <Text style={styles.sub}>
        {bundle.products.length} item{bundle.products.length > 1 ? 's' : ''} · Save $
        {bundle.savings.toFixed(2)}
      </Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAddBundle(bundle)}
        activeOpacity={0.8}
      >
        <Text style={styles.addBtnText}>Add Bundle</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FDF5EE',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DDD3',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  dismissBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 1,
  },
  dismissText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  sparkle: {
    fontSize: 22,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B2414',
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#8A7560',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
