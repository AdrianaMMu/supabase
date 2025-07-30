import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/src/lib/supabase';
import { useAuth, CustomUser } from '@/src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSessionMissingError } from '@supabase/supabase-js';
import { router } from 'expo-router'; 

export default function Profile() {
  const { user, setAuth } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(user?.avatar_url ?? null);
  const [selectedTab, setSelectedTab] = useState<'publicados' | 'salvos'>('publicados');

  async function handleSignout() {
  try {
    // 1) Tenta fazer logout
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

  } catch (err: any) {
    // 2) Se for AuthSessionMissingError, ignora — já não havia sessão
    const isMissing = err instanceof AuthSessionMissingError
      || err.message?.includes('Auth session missing');
    if (!isMissing) {
      console.error('Erro ao sair:', err);
      return Alert.alert('Erro ao sair da conta', err.message);
    }
  } finally {
    // 3) Limpa contexto e AsyncStorage manualmente
    setAuth(null);

    try {
      await AsyncStorage.removeItem('supabase.auth.token');  
    } catch { /* se falhar, não faz mal */ }

    // 4) redirecione ao login, se usar router
    router.replace('/(auth)/signin/page');
  }
}
  async function handleImagePick() {
    try {
      // 1. Permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à galeria.');
        return;
      }

      // 2. Seleção de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        base64: true
      });
      if (result.canceled) return;

      // 3. Converte Base64 em ArrayBuffer
      const base64 = result.assets[0].base64!;
      const buffer = decode(base64);

      // 4. Upload para o bucket “imagem”
      const fileName = `foto_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('imagem')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      if (uploadError) {
        console.error('Upload erro:', uploadError.message);
        Alert.alert('Erro', 'Não foi possível enviar a imagem.');
        return;
      }

      // 5. Recupera URL pública
      const { data: publicUrlData } = supabase.storage
        .from('imagem')
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl ?? null;

      // 6. Atualiza estado local e DB
      setImageUrl(publicUrl);
      if (user) {
        await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        // Sincroniza o contexto com o novo avatar
        const updatedUser: CustomUser = { ...user, avatar_url: publicUrl };
        setAuth(updatedUser);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro', 'Algo deu errado ao enviar a imagem.');
    }
  }

  function handleCreateRelato() {
    Alert.alert('Ação', 'Criar novo relato');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri:
                imageUrl ??
                'https://via.placeholder.com/100/FFFFFF/000000?text=Avatar'
            }}
            style={styles.image}
          />
          <Button title="Alterar imagem" onPress={handleImagePick} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>Bem-vinda</Text>
          <Text style={styles.name}>{user?.nome}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreateRelato}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'publicados' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('publicados')}
        >
          <Text
            style={
              selectedTab === 'publicados' ? styles.activeText : styles.tabText
            }
          >
            Relatos publicados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'salvos' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('salvos')}
        >
          <Text
            style={
              selectedTab === 'salvos' ? styles.activeText : styles.tabText
            }
          >
            Salvos para ler depois
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {selectedTab === 'publicados' ? (
          <Text>📝 Aqui vão os relatos publicados do usuário...</Text>
        ) : (
          <Text>📚 Aqui vão os relatos salvos para ler depois...</Text>
        )}
      </View>

      <Button title="Logout" color="#B22222" onPress={handleSignout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: 12
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8
  },
  infoSection: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  name: {
    fontSize: 16,
    marginTop: 4
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginTop: 2
  },
  addButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#008000',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  plus: {
    fontSize: 24,
    color: '#fff'
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee'
  },
  activeTab: {
    backgroundColor: '#4682B4'
  },
  tabText: {
    color: '#333'
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20
  }
});
