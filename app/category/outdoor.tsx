import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { CategoryCollection } from './CategoryCollection';

export default function OutdoorCategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CategoryCollection
        slug="outdoor"
        title="Outdoor"
        description="Refresh your patio with outdoor furniture and decor built for sunshine."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5F1' },
});
