import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from './context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.trim()?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.title}>{user ? user.name : 'Profile'}</Text>
        <Text style={styles.subtitle}>
          {user
            ? user.email
            : 'You are not signed in yet. Please login or create an account to continue.'}
        </Text>

        {user ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
            <Text style={styles.primaryButtonText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/Login')}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/Signup')}>
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#F3F3F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});
