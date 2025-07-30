//src/app/relato_page/page.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Dimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { router } from 'expo-router';
import RelatoCard from './components/RelatoCard';
import BottomMenu from '@/src/app/components/BottomMenu';
import { RelatoComAutor } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Componente SearchBar completamente isolado
const SearchBar = React.memo(({ 
  searchText, 
  onSearchChange, 
  onClearSearch 
}: {
  searchText: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleSubmitEditing = useCallback(() => {
    inputRef.current?.blur(); // Esconde o teclado ao pressionar "buscar"
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#7B8794" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Buscar por destino..."
          placeholderTextColor="#9B9B9B"
          value={searchText}
          onChangeText={onSearchChange}
          onSubmitEditing={handleSubmitEditing}
          keyboardType="default"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          blurOnSubmit={true}
          selectTextOnFocus={false}
          enablesReturnKeyAutomatically={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={onClearSearch}>
            <Ionicons name="close-circle" size={20} color="#9B9B9B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Componente de estatísticas separado
const StatsSection = React.memo(({ 
  totalRelatos, 
  totalPaises, 
  resultadosBusca 
}: {
  totalRelatos: number;
  totalPaises: number;
  resultadosBusca: number;
}) => (
  <View style={styles.statsContainer}>
    <View style={styles.statsCard}>
      <Ionicons name="people-outline" size={24} color="#4ECDC4" />
      <Text style={styles.statsNumber}>{totalRelatos}</Text>
      <Text style={styles.statsLabel}>Aventuras Compartilhadas</Text>
    </View>
    <View style={styles.statsCard}>
      <Ionicons name="earth-outline" size={24} color="#FF7B54" />
      <Text style={styles.statsNumber}>{totalPaises}</Text>
      <Text style={styles.statsLabel}>Países Visitados</Text>
    </View>
    <View style={styles.statsCard}>
      <Ionicons name="heart-outline" size={24} color="#7B68EE" />
      <Text style={styles.statsNumber}>{resultadosBusca}</Text>
      <Text style={styles.statsLabel}>Resultados da Busca</Text>
    </View>
  </View>
));

export default function RelatoPage() {
  const [relatos, setRelatos] = useState<RelatoComAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const { user } = useAuth();
  
  // Ref para evitar re-renderizações da FlatList
  const flatListRef = useRef<FlatList>(null);

  const fetchRelatos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('relatos')
        .select(`
          id,
          title,
          child_ages,
          season,
          month,
          emojiseason,
          countries,
          locations,
          categories,
          images,
          created_at,
          view_count,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatos:', error.message);
      } else if (data) {
        const mapped = data.map((item: any) => ({
          ...item,
          user: item.users,
        }));
        setRelatos(mapped);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRelatos();
  }, [fetchRelatos]);

  useFocusEffect(
    React.useCallback(() => {
      
      fetchRelatos();
    }, [fetchRelatos])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRelatos();
  }, [fetchRelatos]);

  // Handlers para busca - useCallback para manter referência estável
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  // Filtrar relatos - memoizado mas independente do searchText
  const filteredRelatos = useMemo(() => {
    let filtered = relatos;

    // Aplicar filtro por temporada
    if (selectedFilter !== 'todos') {
      filtered = filtered.filter(relato => 
        relato.season?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Aplicar busca por texto
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(relato =>
        relato.title?.toLowerCase().includes(searchLower) ||
        relato.user?.name?.toLowerCase().includes(searchLower) ||
        relato.countries?.some(country => 
          country.name?.toLowerCase().includes(searchLower)
        ) ||
        relato.locations?.some(location => 
          location.toLowerCase().includes(searchLower)
        )
      );
    }

    return filtered;
  }, [searchText, selectedFilter, relatos]);

  // Stats calculados apenas quando necessário
  const stats = useMemo(() => ({
    totalRelatos: relatos.length,
    totalPaises: new Set(relatos.flatMap(r => r.countries?.map(c => c.name) || [])).size,
    resultadosBusca: filteredRelatos.length
  }), [relatos, filteredRelatos.length]);

  // Header fixo - nunca muda
  const HeaderComponent = useMemo(() => (
    <View>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Olá, {user?.name || 'Viajante'}! ✈️
              </Text>
              <Text style={styles.welcomeSubtext}>
                Descubra histórias incríveis de famílias pelo mundo
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ImageBackground
        source={require('@/assets/images/relatos.png')}
        style={styles.relatoImageBackground}
        resizeMode="cover"
      >
        {/* Gradiente escuro por cima da imagem */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.3)']}
          style={styles.topOverlay}
        />

        {/* Conteúdo sobre a imagem */}
        <View style={styles.topContent}>
          <Text style={styles.relatoTitle}>Relatos Inspiradores</Text>
          <Text style={styles.relatoSubtitle}>
            Histórias reais de famílias que exploraram o mundo juntas 🌍
          </Text>
        </View>
      </ImageBackground>

      {/* Barra de busca */}
      <SearchBar 
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {/* Seção de estatísticas */}
      <StatsSection 
        totalRelatos={stats.totalRelatos}
        totalPaises={stats.totalPaises}
        resultadosBusca={stats.resultadosBusca}
      />

      {/* Título da seção */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimas Aventuras 🌟</Text>
        <Text style={styles.sectionSubtitle}>
          Inspire-se com as experiências de outras famílias
        </Text>
      </View>
    </View>
  ), [user?.name, searchText, handleSearchChange, handleClearSearch, stats]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Nenhuma aventura ainda!</Text>
      <Text style={styles.emptySubtext}>
        Seja a primeira família a compartilhar suas memórias de viagem
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/(panel)/create_relato/page')}
      >
        <LinearGradient
          colors={['#FF7B54', '#FF6B35']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-outline" size={20} color="white" />
          <Text style={styles.emptyButtonText}>Criar Primeiro Relato</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ), []);

  // Renderização do item da lista - keyExtractor estável
  const renderItem = useCallback(({ item }: { item: RelatoComAutor }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: '/relato/[id]',
          params: { id: item.id },
        })
      }
    >
      <RelatoCard relato={item} />
    </TouchableOpacity>
  ), []);

  // KeyExtractor estável
  const keyExtractor = useCallback((item: RelatoComAutor) => item.id, []);

  if (loading) {
    return (
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.loadingContainer}
      >
        <SafeAreaView style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Descobrindo aventuras...</Text>
            <Text style={styles.loadingSubtext}>
              Preparando as melhores histórias para você
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {filteredRelatos.length === 0 && searchText.length === 0 ? (
        <View style={styles.containerWithMenu}>
          {HeaderComponent}
          {renderEmptyState()}
          <BottomMenu />
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={filteredRelatos}
            keyExtractor={keyExtractor}
            ListHeaderComponent={HeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4A90E2']}
                tintColor="#4A90E2"
              />
            }
            renderItem={renderItem}
            ListEmptyComponent={searchText.length > 0 ? () => (
              <View style={styles.emptySearchContainer}>
                <Ionicons name="search-outline" size={60} color="#E0E0E0" />
                <Text style={styles.emptySearchTitle}>Nenhum resultado encontrado</Text>
                <Text style={styles.emptySearchText}>
                  Tente buscar por outro destino ou país
                </Text>
              </View>
            ) : null}
          />
          <BottomMenu />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  containerWithMenu: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    paddingVertical: 0, // Remove padding extra no iOS
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  statsLabel: {
    fontSize: 12,
    color: '#7B8794',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  listContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7B8794',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7B8794',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  emptyButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptySearchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySearchText: {
    fontSize: 14,
    color: '#7B8794',
    textAlign: 'center',
    lineHeight: 20,
  },
  relatoImageBackground: {
    width: '100%',
    height: 260,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginTop: -20
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  topContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
    zIndex: 2
  },
  relatoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  relatoSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '700',
  }
});