import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { CategoryCollection } from './CategoryCollection';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const categorySlug = typeof slug === 'string' ? slug : undefined;

  return (
    <SafeAreaView style={styles.container}>
      {categorySlug ? <CategoryCollection slug={categorySlug} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F5F1',
  },
});
