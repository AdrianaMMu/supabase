// src/app/profile/page.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Pressable,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { useAuth, CustomUser } from '@/src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSessionMissingError } from '@supabase/supabase-js';
import { router } from 'expo-router';
import BottomMenu from '@/src/app/components/BottomMenu';
import { Relato} from '@/src/types';
import { ImageBackground } from 'react-native';


export default function Profile() {
  const { user, setAuth } = useAuth();

  // Estados
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Carrega avatar quando user muda
  useEffect(() => {
    if (user?.avatar_url) {
      setImageUrl(user.avatar_url);
    }
  }, [user]);

  // Carrega relatos do usuário
  useEffect(() => {
    if (user) {
      loadRelatos();
    }
  }, [user]);

  async function loadRelatos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relatos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar relatos:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus relatos');
        return;
      }

      setRelatos(data || []);
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair? Suas memórias estarão aqui quando voltar! 🌟',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            } catch (err: any) {
              const isMissing =
                err instanceof AuthSessionMissingError ||
                err.message?.includes('Auth session missing');
              if (!isMissing) {
                console.error('Erro ao sair:', err);
                Alert.alert('Erro ao sair da conta', err.message);
                return;
              }
            } finally {
              setAuth(null);
              try {
                await AsyncStorage.removeItem('supabase.auth.token');
              } catch {
                // falhar silenciosamente
              }
              router.replace('/(auth)/signin/page?logout=true');
            }
          }
        }
      ]
    );
  }

  async function handleImagePick() {
    try {
      setLoadingAvatar(true);
      
      // 1) Permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à galeria para atualizar sua foto.');
        return;
      }

      // 2) Seleção de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1]
      });
      
      if (result.canceled) return;

      const asset = result.assets[0];
      const buffer = decode(asset.base64!);

      // 3) Upload para Supabase
      const fileName = `avatar_${user?.id}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('imagem')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Upload erro:', uploadError);
        Alert.alert('Erro', 'Não foi possível enviar a imagem.');
        return;
      }

      // 4) Recupera URL pública
      const { data: publicUrlData } = supabase.storage
        .from('imagem')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // 5) Atualiza DB e contexto
      if (user) {
        await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        const updatedUser: CustomUser = {
          ...user,
          avatar_url: publicUrl
        };
        setAuth(updatedUser);
        setImageUrl(publicUrl);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro', 'Algo deu errado ao enviar a imagem.');
    } finally {
      setLoadingAvatar(false);
    }
  }

  function handleCreateRelato() {
    router.push('/create_relato/page');
  }

  function handleEditRelato(id: string) {
  router.push(`/edit_relato/${id}`);
}

  function handleReadRelato(id: string) {
    router.push(`/relato/${id}`);
  }


  async function handleDeleteRelato(relatoId: string, title: string) {
    Alert.alert(
      'Excluir relato',
      `Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('relatos')
                .delete()
                .eq('id', relatoId);

              if (error) {
                Alert.alert('Erro', 'Não foi possível excluir o relato');
                return;
              }

              // Atualiza lista local
              setRelatos(prev => prev.filter(r => r.id !== relatoId));
              Alert.alert('Sucesso', 'Relato excluído com sucesso!');
            } catch (err) {
              console.error('Erro ao excluir:', err);
              Alert.alert('Erro', 'Algo deu errado ao excluir o relato');
            }
          }
        }
      ]
    );
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function getSeasonEmoji(season: string, emojiseason?: string) {
    if (emojiseason) return emojiseason;
    switch (season?.toLowerCase()) {
      case 'verao': case 'verão': return '☀️';
      case 'inverno': return '❄️';
      case 'primavera': return '🌸';
      case 'outono': return '🍂';
      default: return '🌍';
    }
  }

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <SafeAreaView style={styles.container}>
        {/* Background com gradiente */}
        <LinearGradient
          colors={['#4A90E2', '#7B68EE', '#87CEEB']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header do perfil */}
              <ImageBackground
                source={require('@/assets/images/perfil.png')}
                style={styles.topImageBackground}
                resizeMode="cover"
              >
                {/* Sombra ou gradiente */}
                <LinearGradient
                  colors={[
                'rgba(74,144,226,0.4)', 
                'rgba(123,104,238,0.4)', 
                'rgba(135,206,235,0.4)' 
              ]}
              
                  style={styles.topOverlay}
                />
                

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: imageUrl ?? 'https://via.placeholder.com/120/FFFFFF/4A90E2?text=👤'
                  }}
                  style={styles.avatarImage}
                />
                {loadingAvatar && (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#4A90E2" />
                  </View>
                )}
              </View>
              
              <Pressable 
                style={styles.changeAvatarButton} 
                onPress={handleImagePick}
                disabled={loadingAvatar}
              >
                <Ionicons name="camera-outline" size={16} color="white" />
              </Pressable>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Olá, viajante! 🌟</Text>
              <Text style={styles.userName}>
  {(user as any)?.name || user?.email?.split('@')[0]}
</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            {/* Botão para criar novo relato */}
            <Pressable style={styles.createButton} onPress={handleCreateRelato}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={24} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
          </ImageBackground>

          {/* Conteúdo principal */}
          <View style={styles.mainContent}>
            {/* Header dos relatos */}
            <View style={styles.relatosHeader}>
              <Text style={styles.relatosTitle}>Suas Aventuras 📚</Text>
              <Text style={styles.relatosSubtitle}>
                {relatos.length === 0 
                  ? 'Comece sua primeira aventura!' 
                  : `${relatos.length} ${relatos.length === 1 ? 'relato' : 'relatos'} compartilhados`
                }
              </Text>
            </View>

            {/* Lista de relatos */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Carregando suas memórias...</Text>
              </View>
            ) : relatos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="airplane-outline" size={64} color="#B8C6DB" />
                <Text style={styles.emptyTitle}>Nenhuma aventura ainda!</Text>
                <Text style={styles.emptySubtitle}>
                  Que tal compartilhar sua primeira viagem em família? ✈️
                </Text>
                <Pressable style={styles.emptyButton} onPress={handleCreateRelato}>
                  <Text style={styles.emptyButtonText}>Criar primeiro relato</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.relatosList}>
                {relatos.map((relato) => (
                  <View key={relato.id} style={styles.relatoCard}>
                    {/* Header do card */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {relato.title}
                        </Text>
                        <View style={styles.cardMeta}>
                          <Text style={styles.cardDate}>
                            {formatDate(relato.created_at)}
                          </Text>
                          <Text style={styles.cardSeparator}>•</Text>
                          <Text style={styles.cardSeason}>
                            {getSeasonEmoji(relato.season ?? '', relato.emojiseason)} {relato.season ?? ''}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Ações do card */}
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleReadRelato(relato.id)}
                          >
                          <Ionicons name="book-outline" size={18} color="#4ECDC4" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditRelato(relato.id)}
                        >
                          <Ionicons name="create-outline" size={18} color="#4A90E2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteRelato(relato.id, relato.title)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Preview do conteúdo */}
                    {relato.countries && relato.countries.length > 0 && (
  <View style={styles.cardPreview}>
    <View style={styles.countriesContainer}>
      <Ionicons name="location-outline" size={14} color="#7B8794" />
      <Text style={styles.countriesText} numberOfLines={1}>
        {relato.countries.map(c => c.name).join(', ')}
      </Text>
    </View>
  </View>
)}

                    
                    
                  </View>
                ))}
              </View>
            )}

            {/* Botão de logout */}
            <View style={styles.logoutContainer}>
              <Pressable style={styles.logoutButton} onPress={handleSignout}>
                <LinearGradient
                  colors={['#FF7B7B', '#FF6B6B']}
                  style={styles.logoutButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text style={styles.logoutButtonText}>Sair da conta</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Menu inferior */}
      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300
  },
  scrollContainer: {
    flexGrow: 1
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    position: 'relative',
    zIndex: 2,
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  avatarImage: {
    
    width: '100%',
    height: '100%',
    borderRadius: 56,
    backgroundColor: 'white'
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center'
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  userInfo: {
    flex: 1,
    marginLeft: 20
  },
  greeting: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'
  },
  userName: {
    fontSize: 24,
    color: 'white',
    fontWeight: '800',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif'
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  createButton: {
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FEFEFE',
   
    paddingHorizontal: 24,
    paddingTop: 32,
    marginTop: -16,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8
  },
  relatosHeader: {
    marginBottom: 24
  },
  relatosTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif'
  },
  relatosSubtitle: {
    fontSize: 16,
    color: '#7B8794',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  loadingText: {
    fontSize: 16,
    color: '#7B8794',
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7B8794',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 24
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'
  },
  relatosList: {
    gap: 16
  },
  relatoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif'
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  cardDate: {
    fontSize: 14,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  cardSeparator: {
    fontSize: 14,
    color: '#B8C6DB',
    marginHorizontal: 8
  },
  cardSeason: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)'
  },
  cardPreview: {
    marginBottom: 12
  },
  countriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  countriesText: {
    fontSize: 14,
    color: '#5A6C7D',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.1)',
    paddingTop: 12
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6
  },
  logoutContainer: {
    marginTop: 32,
    marginBottom: 100
  },
  logoutButton: {
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'
  },
  topImageBackground: {
  width: '100%',
  height: 220, 
  justifyContent: 'flex-end', // posiciona conteúdo na parte inferior da imagem
  position: 'relative',
  zIndex: 1,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  overflow: 'hidden'
},
topOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.25)', // sombra leve para legibilidade
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  zIndex: 1
},
});