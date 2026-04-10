import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { CategoryCollection } from './CategoryCollection';

export default function LightingCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CategoryCollection
        slug="lighting"
        title="Lighting"
        description="Brighten every room with lighting that blends style and warmth."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F1' },
});
