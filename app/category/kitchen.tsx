import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { CategoryCollection } from './CategoryCollection';

export default function KitchenCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CategoryCollection
        slug="kitchen"
        title="Kitchen"
        description="Curated cookware, tableware, and style-forward kitchen essentials."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F1' },
});
