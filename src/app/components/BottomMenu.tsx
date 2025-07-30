// src/app/components/BottomMenu.tsx
import { usePathname, router, LinkProps } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import travelJournalImage from '../../../assets/images/travel_journal.png';

interface MenuItem {
  label: string;
  ionicon: keyof typeof Ionicons.glyphMap;
  route: LinkProps['href'];
}

const items: readonly MenuItem[] = [
  { label: 'Perfil', ionicon: 'person-outline', route: '/(panel)/profile/page' },
  { label: 'Relatos', ionicon: 'home-outline', route: '/(panel)/relato_page/page' },
  { label: 'Guardado', ionicon: 'bookmark-outline', route: '/(panel)/relato_guardado/page' },
 
];

export default function BottomMenu() {
  const pathname = usePathname();

  // Animation maps
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const opacityAnims = useRef<Record<string, Animated.Value>>({}).current;

  items.forEach(({ route }) => {
    const key = typeof route === 'string' ? route : JSON.stringify(route);

    if (!scaleAnims[key]) {
      scaleAnims[key] = new Animated.Value(1);
    }

    if (!opacityAnims[key]) {
      opacityAnims[key] = new Animated.Value(0.5);
    }
  });

  // Apply animations when pathname changes
  useEffect(() => {
    items.forEach(({ route }) => {
      const key = typeof route === 'string' ? route : JSON.stringify(route);
      const isActive = pathname === route;

      Animated.spring(scaleAnims[key], {
        toValue: isActive ? 1.2 : 1,
        useNativeDriver: true,
        friction: 5,
      }).start();

      Animated.timing(opacityAnims[key], {
        toValue: isActive ? 1 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [pathname]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffffee', '#ffffff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.menu}>
          {items.map(({ label, ionicon, route }) => {
            const isActive = pathname === route;
            const iconName = isActive ? ionicon.replace('-outline', '') : ionicon;
            const key = typeof route === 'string' ? route : JSON.stringify(route);

            return (
              <TouchableOpacity
                key={key}
                onPress={() => router.push(route)}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    {
                      transform: [{ scale: scaleAnims[key] }],
                      opacity: opacityAnims[key],
                    },
                    label === 'Relatos'
                      ? styles.customImageWrapper
                      : isActive
                      ? styles.iconActiveWrapper
                      : styles.iconWrapper,
                    isActive && label === 'Relatos' && styles.customImageWrapperActive,
                  ]}
                >
                  {label === 'Relatos' ? (
                    <Image
                      source={travelJournalImage}
                      style={[
                        styles.customImage,
                        isActive && styles.customImageActive,
                      ]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name={iconName as any}
                      size={24}
                      color={isActive ? '#fff' : '#6B7280'}
                    />
                  )}
                </Animated.View>

                <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  gradient: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 999,
  },
  iconActiveWrapper: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 999,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  customImage: {
    width: 42,
    height: 42,
    tintColor: '#6B7280',
  },
  customImageActive: {
    tintColor: '#fff',
  },
  customImageWrapper: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 999,
  },
  customImageWrapperActive: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 999,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
