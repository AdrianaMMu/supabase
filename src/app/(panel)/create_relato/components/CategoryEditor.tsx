// src/app/(panel)/create_relato/components/CategoryEditor.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Category } from '@/src/types';
import { supabase } from '@/src/lib/supabase';

type Props = {
  categoryKey: string;
  category: Category;
  setCategory: (key: string, updated: Category) => void;
};

export default function CategoryEditor({
  categoryKey,
  category,
  setCategory,
}: Props) {
  const [loadingImage, setLoadingImage] = useState(false);
  const [expanded, setExpanded] = useState(category.visible || false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'É necessário permitir o acesso à galeria para adicionar imagens.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return;

    setLoadingImage(true);
    try {
      const buffer = decode(result.assets[0].base64!);
      const fileName = `category_${categoryKey}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('imagem')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imagem')
        .getPublicUrl(fileName);

      setCategory(categoryKey, {
        ...category,
        images: [...category.images, publicUrl],
      });

      Alert.alert('Sucesso! 📸', 'Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Falha no upload da imagem. Tente novamente.');
    } finally {
      setLoadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Remover imagem',
      'Tem certeza que deseja remover esta imagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const imgs = [...category.images];
            imgs.splice(index, 1);
            setCategory(categoryKey, { ...category, images: imgs });
          },
        },
      ]
    );
  };

  const toggleVisibility = (visible: boolean) => {
    setCategory(categoryKey, { ...category, visible });
    
      setExpanded(visible);
    };


  const hasContent = category.content.trim().length > 0 || category.images.length > 0;
  const isCompleted = category.visible && hasContent;

  const placeholders: Record<string, string> = {
  resumo: 'Faça um resumo geral do roteiro.Foi uma viagem de quantos dias? Quais foram os destaques? Como foi a experiência? Fizeram com agência ou planearam tudo sozinhos.*Aqui é possível trocar o título do tópico.',
  transporte_aereo: 'Como foi o voo? Levou algum brinquedo para distrair seu filho(a)? Companhia aérea? ',
  hospedagem: 'Onde vocês ficaram? Tiveram boa experiência? Hotel, Airbnb, pousada... Avaliação, localização, custo-benefício.',
  alimentacao: 'Restaurantes, comidas típicas, opções para crianças, dicas de onde comer bem.',
  passeios: 'Quais passeios fizeram? Locais visitados, ingressos, tempo de duração, recomendações.',
  transporte_interno: 'Como se locomoveram? Aluguel de carro, transporte público, apps, segurança.',
  outros: 'Outras informações úteis: seguro viagem, clima, imprevistos, curiosidades. *Aqui é possível trocar o título do tópico.',
};

  return (
    <View style={[styles.container, category.visible && styles.containerVisible]}>
      {/* Header da Categoria */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.statusIndicator, isCompleted && styles.statusCompleted]}>
            <Ionicons 
              name={isCompleted ? "checkmark" : "ellipse-outline"} 
              size={16} 
              color={isCompleted ? "white" : "#7B8794"} 
            />
          </View>
          
          <View style={styles.titleContainer}>
            {category.fixed ? (
              <Text style={styles.title}>{category.title}</Text>
            ) : (
              <TextInput
                value={category.title}
                onChangeText={(t) =>
                  setCategory(categoryKey, { ...category, title: t })
                }
                style={styles.titleInput}
                placeholder="Nome da seção..."
                placeholderTextColor="#9B9B9B"
              />
            )}
            
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>
                {category.content.length} caracteres
              </Text>
              {category.images.length > 0 && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>
                    {category.images.length} {category.images.length === 1 ? 'imagem' : 'imagens'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, category.visible && styles.switchLabelActive]}>
              {category.visible ? 'Ativa' : 'Inativa'}
            </Text>
            <Switch
              value={category.visible}
              onValueChange={toggleVisibility}
              trackColor={{ 
                false: 'rgba(123, 135, 148, 0.3)', 
                true: 'rgba(74, 144, 226, 0.3)' 
              }}
              thumbColor={category.visible ? '#4A90E2' : '#7B8794'}
            />
          </View>
          
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#7B8794" 
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Conteúdo Expansível */}
      {expanded && (
        <View style={styles.contentArea}>
          <View style={styles.textInputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="document-text-outline" size={16} color="#7B68EE" /> 
              {' '}Conteúdo da seção
            </Text>
            <TextInput
              value={category.content}
              onChangeText={(c) =>
                setCategory(categoryKey, { ...category, content: c })
              }
              placeholder={placeholders[categoryKey] ?? 'Conte sobre esta parte da viagem...'}
              placeholderTextColor="#9B9B9B"
              multiline
              style={styles.textArea}
              textAlignVertical="top"
            />
          </View>

          {/* Botão de Adicionar Imagem */}
          <TouchableOpacity 
            onPress={handleImagePick} 
            style={styles.imageButton}
            disabled={loadingImage}
          >
            <LinearGradient
              colors={loadingImage ? ['#B0B0B0', '#909090'] : ['#4ECDC4', '#44B3AC']}
              style={styles.imageButtonGradient}
            >
              {loadingImage ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.imageButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={18} color="white" />
                  <Text style={styles.imageButtonText}>Adicionar Foto</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Grid de Imagens */}
          {category.images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={styles.imagesTitle}>
                <Ionicons name="images-outline" size={16} color="#FF7B54" />
                {' '}Fotos adicionadas ({category.images.length})
              </Text>
              
              <View style={styles.imageGrid}>
                {category.images.map((uri, i) => (
                  <View key={i} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity 
                      onPress={() => removeImage(i)}
                      style={styles.removeButton}
                    >
                      <LinearGradient
                        colors={['#FF6B6B', '#FF5252']}
                        style={styles.removeButtonGradient}
                      >
                        <Ionicons name="trash-outline" size={12} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
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
  containerVisible: {
    borderColor: 'rgba(74, 144, 226, 0.3)',
    shadowOpacity: 0.12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 135, 148, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusCompleted: {
    backgroundColor: '#4ECDC4',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
    borderBottomWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    paddingBottom: 4,
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  metaDot: {
    fontSize: 12,
    color: '#7B8794',
    marginHorizontal: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 11,
    color: '#7B8794',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  switchLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 4,
  },
  contentArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.1)',
  },
  textInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6C7D',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  textArea: {
    minHeight: 120,
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    lineHeight: 22,
  },
  imageButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  imagesSection: {
    marginTop: 8,
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6C7D',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  removeButtonGradient: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});