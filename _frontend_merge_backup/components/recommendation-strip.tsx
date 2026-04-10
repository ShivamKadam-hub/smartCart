import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ProductRecord } from '@/lib/api';

type RecommendationStripProps = {
  title: string;
  items: ProductRecord[];
  loading?: boolean;
  loadingText?: string;
  onAction: (item: ProductRecord) => void | Promise<void>;
  actionLabel?: string;
  emptyText?: string;
};

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString('en-IN')}`;
}

function formatLabel(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function RecommendationStrip({
  title,
  items,
  loading = false,
  loadingText = 'Finding personalized picks...',
  onAction,
  actionLabel = 'Add to cart',
  emptyText = 'We could not find any recommendations yet.',
}: RecommendationStripProps) {
  if (!loading && items.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.gold} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <View style={styles.kickerRow}>
            <Ionicons name="sparkles-outline" size={14} color={COLORS.gold} />
            <Text style={styles.kicker}>AI CURATED</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.headerChip}>
          <Text style={styles.headerChipText}>Fresh picks</Text>
        </View>
      </View>
      {loading ? <Text style={styles.loadingText}>{loadingText}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>{formatLabel(item.category || 'Recommended')}</Text>
              </View>
            </View>
            <Text style={styles.eyebrow}>
              {item.brand ? formatLabel(item.brand) : 'Selected for your cart'}
            </Text>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description || `${formatLabel(item.category || 'Product')} pick for your collection.`}
            </Text>
            <View style={styles.footerRow}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.gold} />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => void onAction(item)} activeOpacity={0.85}>
              <Text style={styles.buttonText}>{actionLabel}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const COLORS = {
  gold: '#AF9461',
  goldSoft: 'rgba(175,148,97,0.12)',
  black: '#161616',
  white: '#FFFFFF',
  textSecondary: '#7B7B75',
  border: 'rgba(0,0,0,0.06)',
};

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1.6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
  },
  headerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.goldSoft,
  },
  headerChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
  },
  loadingText: {
    paddingHorizontal: 24,
    marginBottom: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  row: {
    paddingHorizontal: 24,
    gap: 14,
    paddingBottom: 12,
  },
  card: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 10,
  },
  imageBadge: {
    position: 'absolute',
    left: 10,
    bottom: 18,
    backgroundColor: 'rgba(22,22,22,0.78)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imageBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  description: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
    minHeight: 32,
  },
  footerRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.black,
  },
  button: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
