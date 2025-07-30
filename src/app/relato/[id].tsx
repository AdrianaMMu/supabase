//src/app/relato/[id]
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  SafeAreaView, 
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { RelatoComAutor } from '@/src/types';

const { width } = Dimensions.get('window');

export default function RelatoDetalhado() {
  const { id } = useLocalSearchParams();
  const [relato, setRelato] = useState<RelatoComAutor | null>(null);
  const [loading, setLoading] = useState(true);

// src/app/relato/[id]/page.tsx
useEffect(() => {
  if (!id) return;

  (async () => {
    // 1) Incrementa via RPC, sem depender de relato.state
    await supabase.rpc('increment_view_count', { relato_uuid: id });

    // 2) Busca o relato com view_count atualizado
    const { data, error } = await supabase
      .from('relatos')
      .select(`
        id, title, countries, month, season, emojiseason,
        child_ages, locations, categories, categories_order,
        visibility, resumo_image, user_id, view_count,
        created_at, users ( id, name, avatar_url )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setRelato(null);
    } else {
      setRelato({ ...data, user: data.users });
    }
    setLoading(false);
  })();
}, [id]);



  const getFlagEmoji = (code: string) =>
    String.fromCodePoint(...code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)));

  const formatarIdade = (meses: number): string => {
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    const anos = Math.floor(meses / 12);
    const restoMeses = meses % 12;
    if (restoMeses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${restoMeses} ${restoMeses === 1 ? 'mês' : 'meses'}`;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.loadingContainer}
      >
        <SafeAreaView style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Carregando aventura...</Text>
            <Text style={styles.loadingSubtext}>
              Preparando esta história incrível para você
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!relato) {
    return (
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.loadingContainer}
      >
        <SafeAreaView style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <Ionicons name="map-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Aventura não encontrada</Text>
            <Text style={styles.emptySubtext}>
              Esta história pode ter sido removida ou não existe mais
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={['#FF7B54', '#FF6B35']}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="arrow-back-outline" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Voltar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const capa =
    relato.resumo_image ??
    (Array.isArray(relato.categories?.resumo?.images) &&
      relato.categories.resumo.images[0]);

  const ordemCategorias = Array.isArray(relato.categories_order)
    ? relato.categories_order
    : JSON.parse(relato.categories_order || '[]');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com gradiente e botão voltar */}
        <LinearGradient
          colors={['#4A90E2', '#7B68EE', '#87CEEB']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <View style={styles.backButtonContainer}>
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.headerInfo}>
                <Text style={styles.headerSubtitle}>Aventura Familiar</Text>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {relato.title}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        

        {/* Banner da aventura */}
        {capa && (
          <View style={styles.bannerContainer}>
            <Image source={{ uri: capa }} style={styles.banner} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.bannerOverlay}
            />
          </View>
        )}
      

        {/* Card do autor */}
        <View style={styles.authorCard}>
          <View style={styles.authorInfo}>
            {relato.user?.avatar_url ? (
              <Image source={{ uri: relato.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={24} color="#7B8794" />
              </View>
            )}
            <View style={styles.authorTextContainer}>
              <Text style={styles.authorLabel}>Compartilhado por</Text>
              <Text style={styles.authorName}>{relato.user?.name}</Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {new Date(relato.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
          {/* Novo bloco para exibir o contador */}
        <View style={styles.statsRow}>
          <Ionicons name="eye-outline" size={16} color="#FF7B54" />
          <Text style={styles.statsText}>
            Visualizações: {relato.view_count ?? 0}
          </Text>
        </View>

        {/* Informações da viagem */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detalhes da Aventura ✈️</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="earth-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Destinos</Text>
              <Text style={styles.infoValue}>
                {relato.countries?.map(c => `${getFlagEmoji(c.code)} ${c.name}`).join(', ')}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={20} color="#FF7B54" />
              <Text style={styles.infoLabel}>Locais</Text>
              <Text style={styles.infoValue}>
                {relato.locations?.join(', ')}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
              <Text style={styles.infoLabel}>Quando</Text>
              <Text style={styles.infoValue}>
                {relato.month} • {relato.season} {relato.emojiseason}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={20} color="#7B68EE" />
              <Text style={styles.infoLabel}>Idades</Text>
              <Text style={styles.infoValue}>
                {relato.child_ages?.map(formatarIdade).join(', ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Conteúdo das categorias */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>História da Viagem 📖</Text>
          
          {ordemCategorias.map((key: string) => {
            const categoria = relato.categories?.[key];
            const content = categoria?.content ?? '';
            const hasContent = typeof content === 'string' && content.trim().length > 0;
            const isVisible = categoria?.visible;

            const imagens = Array.isArray(categoria?.images)
              ? categoria.images.filter(img => img !== capa)
              : [];

            if (!categoria || !isVisible || !hasContent) return null;

            return (
              <View key={key} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{categoria.title}</Text>
                <Text style={styles.categoryContent}>{categoria.content}</Text>

                {imagens.length > 0 && (
                  <View style={styles.imagesContainer}>
                    {imagens.map((img, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: img }} style={styles.categoryImage} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Botão de ação */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="heart-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Gostei desta aventura!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
    lineHeight: 26,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  banner: {
    width: '100%',
    height: 240,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  authorCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorTextContainer: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 12,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
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
  infoLabel: {
    fontSize: 12,
    color: '#7B8794',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
    lineHeight: 18,
  },
  contentSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  categoryContent: {
    fontSize: 15,
    color: '#5A6C7D',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    marginBottom: 16,
  },
  imagesContainer: {
    gap: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 200,
  },
  actionSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
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

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
});