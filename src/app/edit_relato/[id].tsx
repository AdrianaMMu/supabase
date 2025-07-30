import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Relato, Category } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


import UserHeader from '../(panel)/create_relato/components/UserHeader';
import CountrySelector from '../(panel)/create_relato/components/CountrySelector';
import MonthStationPicker from '../(panel)/create_relato/components/MonthStationPicker';
import ChildAgePicker from '../(panel)/create_relato/components/ChildAgePicker';
import LocationInput from '../(panel)/create_relato/components/LocationInput';
import CategoryEditor from '../(panel)/create_relato/components/CategoryEditor';
import CategoryOrderManager from '../(panel)/create_relato/components/CategoryOrderManager';

export default function EditRelatoPage() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const relatoId = typeof id === 'string' ? id : null;

  const [relato, setRelato] = useState<Relato | null>(null);

  const updateRelato = (fn: React.SetStateAction<Relato>) => {
  setRelato((prev) => {
    if (prev === null) return prev;

    if (typeof fn === 'function') {
      return (fn as (prev: Relato) => Relato)(prev);
    }

    return fn;
  });
};


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Utilitário para garantir que todas as categorias sejam exibidas mesmo que faltando na ordem
  const getFullCategoryOrder = () => {
    const allKeys = Object.keys(relato?.categories || {});
    const currentOrder = Array.isArray(relato?.categories_order) ? relato.categories_order : [];
    return [...new Set([...currentOrder, ...allKeys])];
  };

  useEffect(() => {
    async function fetchRelato() {
      if (!relatoId) return;

      const { data, error } = await supabase
        .from('relatos')
        .select('*')
        .eq('id', relatoId)
        .single();

      if (error || !data) {
        Alert.alert('Erro', 'Não foi possível carregar o relato.');
        return;
      }

      setRelato(data as Relato);
      console.log('Categorias no relato:', data.categories_order);
      console.log('Chaves em categories:', Object.keys((data as Relato).categories));
      setLoading(false);
    }

    fetchRelato();
  }, [relatoId]);

  const handleUpdateRelato = async () => {
    if (!relato) return;

    const valid = (Object.values(relato.categories) as Category[]).filter(
      (c) => c.visible && c.content.trim().length > 0
    );
    if (valid.length < 3) {
      Alert.alert('Preencha mais categorias', 'Você precisa completar pelo menos 3 seções.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .update({
          title: relato.title,
          countries: relato.countries,
          month: relato.month,
          season: relato.season,
          emojiseason: relato.emojiseason,
          child_ages: relato.child_ages,
          locations: relato.locations,
          categories: relato.categories,
          categories_order: getFullCategoryOrder(), // salva ordem completa
          visibility: relato.visibility,
        })
        .eq('id', relatoId);

      if (error) {
        Alert.alert('Erro', 'Não foi possível atualizar o relato.');
      } else {
        Alert.alert('Sucesso', 'Relato atualizado!');
        router.back();
      }
    } catch {
      Alert.alert('Erro', 'Algo deu errado ao atualizar o relato.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !relato) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#36CFC9" />
        <Text style={styles.loadingText}>Carregando relato...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <FlatList
        data={getFullCategoryOrder()}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const categoria = relato.categories[item];
          return (
            categoria && (
              <CategoryEditor
                key={item}
                categoryKey={item}
                category={categoria}
                setCategory={(k, updated) =>
                  setRelato((prev) =>
                    prev
                      ? {
                          ...prev,
                          categories: {
                            ...prev.categories,
                            [k]: updated,
                          },
                        }
                      : prev
                  )
                }
              />
            )
          );
        }}
        ListHeaderComponent={
  <View>
    <SafeAreaView style={styles.headerWrapper}>
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#87CEEB']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ImageBackground
        source={require('@/assets/images/editar.png')} // ou reutilize a mesma imagem
        style={styles.topImageBackground}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>✏️ Editar relato</Text>
            <Text style={styles.welcomeSubtext}>
              Quer mudar algo? Lembrou de algum detalhe importante?Atualize sua aventura com novas experiências!!
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>

    {/* Informações básicas */}
    <View style={styles.content}>
      {user && <UserHeader user={user} relato={relato as Relato} setRelato={updateRelato} />}
      <CountrySelector relato={relato as Relato} setRelato={updateRelato} />
      <MonthStationPicker relato={relato as Relato} setRelato={updateRelato} />
      <ChildAgePicker relato={relato as Relato} setRelato={updateRelato} />
      <LocationInput relato={relato as Relato} setRelato={updateRelato} />
    </View>
  </View>
}

        ListFooterComponent={
          <View style={styles.footer}>
            <CategoryOrderManager
              categories={relato.categories}
              categoryOrder={getFullCategoryOrder()}
              setCategoryOrder={(order) =>
                setRelato((prev) =>
                  prev
                    ? {
                        ...prev,
                        categories_order: order,
                      }
                    : prev
                )
              }
            />
            <TouchableOpacity
              onPress={handleUpdateRelato}
              style={styles.saveButton}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Salvando...' : '💾 Atualizar relato'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    
  },
  content: {
  padding: 16,
  marginTop: -32,
  zIndex: 2,
  backgroundColor: 'white',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 64,
  },
  saveButton: {
    backgroundColor: '#36CFC9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#888',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  headerWrapper: {
  position: 'relative',
  width: '100%',
  backgroundColor: '#4A90E2',
   zIndex: 0,
},

gradientBackground: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 0,
},

topImageBackground: {
  width: '100%',
  height: 260,
  justifyContent: 'flex-end',
  zIndex: 1,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  overflow: 'hidden',
},

headerContent: {
  paddingHorizontal: 20,
  paddingBottom: 24,
  zIndex: 2,
},

welcomeSection: {
  marginBottom: 20,
},

welcomeText: {
  fontSize: 26,
  color: 'white',
  marginBottom: 12,
  fontWeight: '900',
  fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  letterSpacing: 0.5,
  textShadowColor: 'rgba(0, 0, 0, 0.8)', // menos opaco que 1
  textShadowOffset: { width: 0, height: 2 }, // sombra mais visível
  textShadowRadius: 6, // mais suave
},

welcomeSubtext: {
  fontSize: 16,
  color: 'rgba(255, 255, 255, 0.95)',
  lineHeight: 22,
  paddingHorizontal: 20,
  fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  fontWeight: '700',
  textShadowColor: 'rgba(0, 0, 0, 0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
},

});
