import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { CategoryCollection } from './CategoryCollection';

export default function DecorCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CategoryCollection
        slug="decor"
        title="Decor"
        description="Accents and accessories designed to complete your living space."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F1' },
});
