import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { Relato, Category } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { router } from 'expo-router';
import { ImageBackground } from 'react-native';

import UserHeader from './components/UserHeader';
import CountrySelector from './components/CountrySelector';
import MonthStationPicker from './components/MonthStationPicker';
import ChildAgePicker from './components/ChildAgePicker';
import LocationInput from './components/LocationInput';
import CategoryEditor from './components/CategoryEditor';
import CategoryOrderManager from './components/CategoryOrderManager';


export default function CreateRelatoPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [relato, setRelato] = useState<Relato>({
    id: 'novo-relato',
    created_at: new Date().toISOString(),
    title: '',
    countries: [],
    month: '',
    season: '',
    emojiseason: '',
    child_ages: [],
    locations: [],
    categories: {
      resumo: {
        title: 'Resumo do roteiro',
        content: '',
        images: [],
        visible: true,
        fixed: false,
      },
      transporte_aereo: {
        title: 'Transporte Aéreo',
        content: '',
        images: [],
        visible: false,
        fixed: true,
      },
      hospedagem: {
        title: 'Hospedagem',
        content: '',
        images: [],
        visible: false,
        fixed: true,
      },
      alimentacao: {
        title: 'Alimentação',
        content: '',
        images: [],
        visible: false,
        fixed: true,
      },
      passeios: {
        title: 'Passeios',
        content: '',
        images: [],
        visible: false,
        fixed: true,
      },
      transporte_interno: {
        title: 'Transporte Interno',
        content: '',
        images: [],
        visible: false,
        fixed: true,
      },
      outros: {
        title: 'Outros',
        content: '',
        images: [],
        visible: false,
        fixed: false,
      },
    },
    categories_order: [
      'resumo',
      'transporte_aereo',
      'hospedagem',
      'alimentacao',
      'passeios',
      'transporte_interno',
      'outros',
    ],
    visibility: {},
    user_id: user?.id || '',
  });

  const handleSaveRelato = async () => {
    const validCategories = (Object.values(relato.categories) as Category[]).filter(
      (cat) => cat.visible && cat.content.trim().length > 0
    );

    if (validCategories.length < 3) {
      Alert.alert(
        'Preencha mais categorias',
        'Você precisa completar pelo menos 3 seções do relato.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('relatos')
        .insert([
          {
            title: relato.title,
            countries: relato.countries,
            month: relato.month,
            season: relato.season,
            emojiseason: relato.emojiseason,
            child_ages: relato.child_ages,
            locations: relato.locations,
            categories: relato.categories,
            categories_order: relato.categories_order,
            visibility: relato.visibility,
            user_id: relato.user_id,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Erro ao salvar relato:', error);
        Alert.alert('Erro', 'Não foi possível salvar o relato.');
      } else {
        Alert.alert(
          'Sucesso! 🎉',
          'Seu relato foi salvo com sucesso!',
          [
            {
              text: 'Ver Relatos',
              onPress: () => router.push('/(panel)/relato_page/page'),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro', 'Algo deu errado ao salvar o relato.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <>
      {/* Header com gradiente */}

      <SafeAreaView style={styles.headerWrapper}>
  {/* Gradiente ao fundo */}
  <LinearGradient
    colors={['#4A90E2', '#7B68EE', '#87CEEB']}
    style={styles.gradientBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  />

  {/* Imagem por cima do gradiente */}
  <ImageBackground
    source={require('@/assets/images/criar.png')}
    style={styles.topImageBackground}
    resizeMode="cover"
  >
    {/* Texto por cima da imagem */}
    <View style={styles.headerContent}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          ✍️ Criar nova aventura
        </Text>
        <Text style={styles.welcomeSubtext}>
          Compartilhe suas experiências incríveis com outras famílias
        </Text>
      </View>
    </View>
  </ImageBackground>
</SafeAreaView>

      {/* Seção de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <Ionicons name="create-outline" size={24} color="#4ECDC4" />
          <Text style={styles.progressNumber}>
            {Object.values(relato.categories).filter(cat => cat.visible && cat.content.trim()).length}
          </Text>
          <Text style={styles.progressLabel}>Seções Preenchidas</Text>
        </View>
        
        <View style={styles.progressCard}>
          <Ionicons name="location-outline" size={24} color="#FF7B54" />
          <Text style={styles.progressNumber}>{relato.countries.length}</Text>
          <Text style={styles.progressLabel}>Países Selecionados</Text>
        </View>
        
        <View style={styles.progressCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#7B68EE" />
          <Text style={styles.progressNumber}>
            {relato.title && relato.countries.length > 0 && relato.month ? '✓' : '○'}
          </Text>
          <Text style={styles.progressLabel}>Dados Básicos</Text>
        </View>
      </View>

      {/* Título da seção */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Informações da Viagem 🌍</Text>
        <Text style={styles.sectionSubtitle}>
          Conte-nos sobre sua aventura em família
        </Text>
      </View>
    </>
  );

  const renderBasicInfo = () => (
    <View style={styles.basicInfoContainer}>
      {user && <UserHeader user={user} relato={relato} setRelato={setRelato} />}
      
      <View style={styles.inputSection}>
        <CountrySelector relato={relato} setRelato={setRelato} />
      </View>
      
      <View style={styles.inputSection}>
        <MonthStationPicker relato={relato} setRelato={setRelato} />
      </View>
      
      <View style={styles.inputSection}>
        <ChildAgePicker relato={relato} setRelato={setRelato} />
      </View>
      
      <View style={styles.inputSection}>
        <LocationInput relato={relato} setRelato={setRelato} />
      </View>

      {/* Separador com título das categorias */}
      <View style={styles.categoriesSeparator}>
        <View style={styles.separatorLine} />
        <Text style={styles.categoriesTitle}>📝 Seções do Relato</Text>
        <View style={styles.separatorLine} />
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.orderManagerContainer}>
        <CategoryOrderManager
          categories={relato.categories}
          categoryOrder={relato.categories_order}
          setCategoryOrder={(order) =>
            setRelato((prev) => ({ ...prev, categories_order: order }))
          }
        />
      </View>

      <TouchableOpacity 
        onPress={handleSaveRelato} 
        style={styles.saveButton}
        disabled={loading}
      >
        <LinearGradient
          colors={loading ? ['#B0B0B0', '#909090'] : ['#FF7B54', '#FF6B35']}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="white" />
              <Text style={styles.saveText}>Salvando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveText}>Salvar Relato</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <FlatList
          data={relato.categories_order}
          keyExtractor={(item) => item}
          extraData={relato.categories_order}
          ListHeaderComponent={
            <View>
              {renderHeader()}
              {renderBasicInfo()}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.categoryContainer}>
              <CategoryEditor
                categoryKey={item}
                category={relato.categories[item]}
                setCategory={(k, updated) =>
                  setRelato((prev) => ({
                    ...prev,
                    categories: {
                      ...prev.categories,
                      [k]: updated,
                    },
                  }))
                }
              />
            </View>
          )}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeSection: {
    marginBottom: 5,
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
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    gap: 12,
  },
  progressCard: {
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
  progressNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif',
  },
  progressLabel: {
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
  basicInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  categoriesSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(123, 104, 238, 0.2)',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B68EE',
    marginHorizontal: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 24,
  },
  orderManagerContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF7B54',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  scrollContent: {
    paddingBottom: 20,
  },
 headerWrapper: {
  position: 'relative',
  width: '100%',
  height: 220,
  backgroundColor: '#4A90E2', // fallback para gradiente
},

gradientBackground: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 0,
},

topImageBackground: {
  width: '100%',
  height: '100%',
  justifyContent: 'flex-end',
  zIndex: 1,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  overflow: 'hidden',
},




});