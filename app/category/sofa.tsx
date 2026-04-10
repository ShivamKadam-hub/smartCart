import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { CategoryCollection } from './CategoryCollection';

export default function SofaCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CategoryCollection
        slug="sofa"
        title="Sofa"
        description="Comfortable seating pieces designed for modern living rooms."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F1' },
});
