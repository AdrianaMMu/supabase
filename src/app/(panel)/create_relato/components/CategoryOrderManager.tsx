import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Category } from '@/src/types';

type Props = {
  categories: Record<string, Category>;
  categoryOrder: string[];
  setCategoryOrder: (order: string[]) => void;
};

export default function CategoryOrderManager({
  categories,
  categoryOrder,
  setCategoryOrder,
}: Props) {
  const itemsToShow = Array.isArray(categoryOrder) ? categoryOrder : [];

  const renderItem = ({ item, drag, isActive   }: RenderItemParams<string>) => {
    const cat = categories[item];
    const isVisible = cat?.visible ?? false;

    return (
      <TouchableOpacity
        onLongPress={drag}
        style={[
          styles.item,
          !isVisible && styles.invisibleItem,
           isActive && styles.activeItem,
        ]}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.itemText,
            !isVisible && styles.invisibleText,
          ]}
        >
          {cat?.title ?? item}
          {!isVisible && ' (oculta)'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📦 Ordene as seções do relato</Text>

      {itemsToShow.length === 0 ? (
        <Text style={styles.empty}>
          Nenhuma categoria para ordenar.
        </Text>
      ) : (
        <DraggableFlatList
          data={itemsToShow}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          onDragEnd={({ data }) => setCategoryOrder(data)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  empty: {
    fontSize: 14,
    color: '#7B8794',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  item: {
    backgroundColor: '#F8FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  invisibleItem: {
    opacity: 0.6,
  },
  invisibleText: {
    fontStyle: 'italic',
    color: '#7B8794',
  },
  activeItem: {
  backgroundColor: '#E0F7FA', // azul claro durante o drag
  transform: [{ scale: 1.02 }],
  shadowColor: '#4A90E2',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 4,
},
});
