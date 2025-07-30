//src/app/relato_page/components/RelatoCard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RelatoComAutor } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { guardarRelato, removerRelatoGuardado } from '@/src/services/relatoGuardadoService';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RelatoCard({
  relato,
  mostrarGuardar = true,
  onRemover,
}: {
  relato: RelatoComAutor;
  mostrarGuardar?: boolean;
  onRemover?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isGuardado, setIsGuardado] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [viewCount, setViewCount] = useState<number>(0);

  // DEBUG: Adicione este console.log para verificar a estrutura dos dados
  {/*useEffect(() => {
    console.log('=== DEBUG RELATO ===');
    console.log('Relato completo:', JSON.stringify(relato, null, 2));
    console.log('Categories:', relato.categories);
    console.log('Resumo:', relato.categories?.resumo);
    console.log('Images gerais:', relato.images);
    console.log('Images do resumo:', relato.categories?.resumo?.images);
    console.log('==================');
  }, [relato]);*/}

  useEffect(() => {
    const verificarGuardado = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('relatos_guardados')
          .select('id')
          .eq('user_id', user.id)
          .eq('relato_id', relato.id)
          .single();
        if (data) setIsGuardado(true);
      } catch (error) {
        console.error('Erro ao verificar relato guardado:', error);
      }
    };

    const verificarLike = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('relatos_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('relato_id', relato.id)
          .single();
        if (data) setIsLiked(true);
      } catch (error) {
        console.error('Erro ao verificar like:', error);
      }
    };

    const buscarEstatisticas = async () => {
  try {
    // 1) Likes
    const { count: likesCount } = await supabase
      .from('relatos_likes')
      .select('*', { count: 'exact', head: true })
      .eq('relato_id', relato.id);
    setLikeCount(likesCount ?? 0);

    // 2) Views — sempre atribui, mesmo que seja 0
    setViewCount(relato.view_count ?? 0);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
};
        

    verificarGuardado();
    verificarLike();
    buscarEstatisticas();
  }, [user, relato.id]);

  const handleGuardarRelato = async () => {
    if (!user) return;
    
    try {
      const { success, error } = await guardarRelato(user.id, relato.id);
      if (success) {
        setIsGuardado(true);
        Alert.alert('Sucesso', 'Relato guardado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível guardar o relato.');
        console.error(error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao guardar relato.');
      console.error(error);
    }
  };

  const handleRemoverRelato = async () => {
    if (!user) return;
    
    try {
      const { success, error } = await removerRelatoGuardado(user.id, relato.id);
      if (success) {
        setIsGuardado(false);
        Alert.alert('Removido', 'Relato removido dos guardados.');
        if (onRemover) onRemover();
      } else {
        Alert.alert('Erro', 'Não foi possível remover o relato.');
        console.error(error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao remover relato.');
      console.error(error);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Remover like
        const { error } = await supabase
          .from('relatos_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('relato_id', relato.id);
        
        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('relatos_likes')
          .insert({ user_id: user.id, relato_id: relato.id });
        
        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar like:', error);
    }
  };

  const getSeasonEmoji = (season: string) => {
    const seasonEmojis: { [key: string]: string } = {
      Primavera: '🌸',
      Verão: '☀️',
      Outono: '🍂',
      Inverno: '❄️',
    };
    return seasonEmojis[season] || '🌍';
  };

  const formatarIdade = (meses: number) => {
    if (!Number.isFinite(meses) || meses < 0) return 'Idade não informada';
    const anos = Math.floor(meses / 12);
    const restoMeses = meses % 12;
    if (anos > 0 && restoMeses > 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${restoMeses} ${restoMeses === 1 ? 'mês' : 'meses'}`;
    } else if (anos > 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${restoMeses} ${restoMeses === 1 ? 'mês' : 'meses'}`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Função para obter imagens de forma consistente
  const getImages = () => {
    let allImages: string[] = [];
    // Primeiro, verificar imagens do resumo
    if (relato.categories?.resumo?.images && Array.isArray(relato.categories.resumo.images)) {
      allImages = [...relato.categories.resumo.images];
    }
    
    // Depois, adicionar imagens gerais (evitando duplicatas)
    if (relato.images && Array.isArray(relato.images)) {
      const newImages = relato.images.filter(img => !allImages.includes(img));
      allImages = [...allImages, ...newImages];
    }
    
    // Filtrar URLs válidas
    return allImages.filter(img => img && typeof img === 'string' && img.trim() !== '');
  };

  // Função para verificar se o resumo existe e tem conteúdo
  const hasResumo = () => {
    return relato.categories?.resumo?.content && 
           relato.categories.resumo.content.trim() !== '';
  };

  const images = getImages();

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(74, 144, 226, 0.05)', 'rgba(123, 104, 238, 0.05)']}
        style={styles.headerGradient}
      >
        {/* Cabeçalho com avatar e título */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {relato.user?.avatar_url ? (
                <Image source={{ uri: relato.user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person-outline" size={20} color="#4A90E2" />
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.title} numberOfLines={2}>{relato.title}</Text>
              <Text style={styles.author}>por {relato.user?.name || 'Aventureiro Anônimo'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        {/* Informações básicas */}
        <View style={styles.infoGrid}>
          {/* Países */}
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
              <Ionicons name="earth-outline" size={16} color="#4ECDC4" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {relato.countries?.map(c => c.name).join(', ') || 'Países não informados'}
            </Text>
          </View>

          {/* Estação */}
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: 'rgba(255, 123, 84, 0.1)' }]}>
              <Text style={styles.seasonEmoji}>
                {relato.emojiseason || getSeasonEmoji(relato.season ?? '')}
              </Text>
            </View>
            <Text style={styles.infoText}>
              {relato.month} - {relato.season}
            </Text>
          </View>

          {/* Localizações */}
          {relato.locations?.length > 0 && (
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: 'rgba(255, 123, 84, 0.1)' }]}>
                <Ionicons name="location-outline" size={16} color="#FF7B54" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {relato.locations.join(', ')}
              </Text>
            </View>
          )}

          {/* Idade da criança */}
          {relato.child_ages?.length > 0 && (
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: 'rgba(123, 104, 238, 0.1)' }]}>
                <Ionicons name="happy-outline" size={16} color="#7B68EE" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {relato.child_ages
                  .map((idade) => formatarIdade(Number(idade)))
                  .join(', ')
                }
              </Text>
            </View>
          )}
        </View>

        {/* ==== BLOCO DO RESUMO - COM VERIFICAÇÃO MELHORADA ==== */}
        {hasResumo() && (
          <View style={styles.resumoContainer}>
            <View style={styles.resumoHeader}>
              <Ionicons name="document-text-outline" size={16} color="#4A90E2" />
              <Text style={styles.resumoLabel}>Resumo</Text>
            </View>
            <Text style={styles.resumoText} >
              {relato.categories.resumo.content}
            </Text>
          </View>
        )}

        {/* Imagens - COM VERIFICAÇÃO MELHORADA */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            style={styles.imageScrollContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContent}
          >
            {images.map((imgUrl, idx) => (
              <View key={`image-${idx}`} style={styles.imageContainer}>
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Erro ao carregar image:', imgUrl, error.nativeEvent.error);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}

       
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color="#7B8794" />
          <Text style={styles.statText}>{formatNumber(viewCount)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={handleLikeToggle}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={16} 
            color={isLiked ? "#FF6B6B" : "#7B8794"} 
          />
          <Text style={[styles.statText, isLiked && { color: '#FF6B6B' }]}>
            {formatNumber(likeCount)}
          </Text>
        </TouchableOpacity>
      </View>


      {/* Rodapé com botões */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('Navegando para relato:', relato.id);
            router.push(`/relato/${relato.id}`);
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4A90E2', '#7B68EE']}
            style={styles.readButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="book-outline" size={16} color="white" />
            <Text style={styles.readButtonText}>Ler Aventura</Text>
          </LinearGradient>
        </TouchableOpacity>

        {mostrarGuardar && (
          <TouchableOpacity
            style={[styles.saveButton, isGuardado && styles.saveButtonActive]}
            onPress={isGuardado ? handleRemoverRelato : handleGuardarRelato}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isGuardado ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isGuardado ? '#4A90E2' : '#7B8794'}
            />
            <Text style={[styles.saveButtonText, isGuardado && styles.saveButtonTextActive]}>
              {isGuardado ? 'Guardado' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.decorationBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  userDetails: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 4,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  author: {
    fontSize: 14,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  seasonEmoji: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#5A6C7D',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  resumoContainer: {
    backgroundColor: 'rgba(74, 144, 226, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeft: 4,
    borderLeftColor: '#4A90E2',
  },
  resumoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  resumoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  resumoText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  imageScrollContainer: {
    marginBottom: 16,
  },
  imageScrollContent: {
    paddingRight: 20,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 140,
    height: 90,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    color: '#7B8794',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    marginRight: 12,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  readButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(123, 135, 148, 0.1)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  saveButtonText: {
    color: '#7B8794',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  saveButtonTextActive: {
    color: '#4A90E2',
  },
  decorationBar: {
    height: 4,
    backgroundColor: '#4ECDC4',
    marginTop: -4,
  },
  
});