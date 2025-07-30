import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { buscarRelatosGuardados } from '@/src/services/relatoGuardadoService';
import RelatoCard from '../relato_page/components/RelatoCard';
import BottomMenu from '@/src/app/components/BottomMenu';
import { router } from 'expo-router';

export default function RelatosGuardadosPage() {
  const { user } = useAuth();
  const [guardados, setGuardados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!user) return;
      const data = await buscarRelatosGuardados(user.id);
      setGuardados(data);
      setLoading(false);
    };

    carregar();
  }, [user]);

  const atualizarLista = (relatoId: string) => {
    setGuardados(prev => prev.filter(item => item.relato.id !== relatoId));
  };

  const renderHeader = () => (
    <>
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
                Olá, {user?.name || 'Viajante'}! 📚
              </Text>
              <Text style={styles.welcomeSubtext}>
                Aqui estão os relatos que você guardou
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Relatos Guardados</Text>
        <Text style={styles.sectionSubtitle}>
          Suas aventuras favoritas estão aqui
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Nada guardado ainda!</Text>
      <Text style={styles.emptySubtext}>
        Explore os relatos e toque em “Guardar” para salvar suas aventuras favoritas
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(panel)/relato_page/page')}
      >
        <LinearGradient
          colors={['#4A90E2', '#7B68EE']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="compass-outline" size={20} color="white" />
          <Text style={styles.emptyButtonText}>Explorar Relatos</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.loadingContainer}
      >
        <SafeAreaView style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Carregando relatos guardados...</Text>
            <Text style={styles.loadingSubtext}>
              Preparando suas aventuras favoritas
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {guardados.length === 0 ? (
        <View style={styles.containerWithMenu}>
          {renderHeader()}
          {renderEmptyState()}
          <BottomMenu />
        </View>
      ) : (
        <>
          <FlatList
            data={guardados}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RelatoCard
                relato={{ ...item.relato, user: item.relato.users }}
                mostrarGuardar={false}
                onRemover={() => atualizarLista(item.relato.id)}
              />
            )}
          />
          <BottomMenu />
        </>
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
  navContainer: {
    gap: 12,
  },
  navButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  navButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonSecondaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
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
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F8FAFB',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6C7D',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterChipText: {
    fontSize: 12,
    color: '#5A6C7D',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  filterChipTextActive: {
    color: 'white',
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
    paddingTop:14,
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
    paddingBottom: 100, // Espaço para o menu inferior
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
    paddingBottom: 100, // Espaço para o menu inferior
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
});