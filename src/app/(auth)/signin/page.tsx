// app/(auth)/signin/page.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { ImageBackground } from 'react-native';


export default function SignIn() {
  const { logout } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuth();

  // Exibe alerta pós-logout
  useEffect(() => {
    if (logout === 'true') {
      Alert.alert('Logout', 'Você saiu com sucesso!');
    }
  }, [logout]);

  // Faz login e busca perfil extra (name, avatar_url)
  async function handleSignIn() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (error || !data.user) {
      return Alert.alert('Erro', error?.message ?? 'Falha no login');
    }

    // Busca dados extras na tabela "users"
    const { data: perfil, error: perfilError } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', data.user.id)
      .single();

    if (perfilError) {
      console.error('Erro ao buscar perfil:', perfilError.message);
    }

    // Monta o CustomUser e atualiza o contexto
    const userComExtras = {
      ...data.user,
      nome: perfil?.name,
      avatar_url: perfil?.avatar_url
    };
    setAuth(userComExtras);

    // Redireciona para o painel
    router.replace('/(panel)/relato_page/page');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Background com gradiente mais suave */}
          <LinearGradient
            colors={['rgba(74,144,226,0.4)',
            'rgba(123,104,238,0.4)',
            'rgba(135,206,235,0.4)']}
            style={styles.backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />



          {/* Header com logo e mensagem inspiradora */}
          
          
  <ImageBackground
  source={require('@/assets/images/praia.png')}
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

  {/* Conteúdo por cima da imagem e da sombra */}
  <View style={styles.topContent}>
    <View style={styles.logoContainer}>
      <Image 
        source={require('@/assets/images/logo_VEF.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.slogan}>Memórias que Conectam</Text>
    <Text style={styles.subtitle}>
      Compartilhe suas aventuras e inspire outras famílias a explorar o mundo juntas
    </Text>
  </View>
</ImageBackground>



          {/* Formulário */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.welcomeText}>Bem-vindos de volta! 🌟</Text>
              <Text style={styles.welcomeSubtext}>Acesse seu baú de memórias e continue inspirando famílias pelo mundo</Text>

              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Seu melhor email"
                    placeholderTextColor="#9B9B9B"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Sua senha secreta"
                    placeholderTextColor="#9B9B9B"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9B9B9B" 
                    />
                  </Pressable>
                </View>
              </View>

              {/* Botão de Login */}
              <Pressable 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSignIn}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FF7B54', '#FF6B35', '#F7931E']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading && <Ionicons name="refresh-outline" size={20} color="white" style={styles.loadingIcon} />}
                  <Text style={styles.buttonText}>
                    {loading ? 'Abrindo o baú...' : 'Entrar na Aventura'}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Link para cadastro */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Nova família aventureira? </Text>
                <Link href="/(auth)/signup/page" style={styles.signupLink}>
                  <Text style={styles.signupLinkText}>Comece sua jornada aqui!</Text>
                </Link>
              </View>

              {/* Decoração */}
              <View style={styles.decorationContainer}>
                <View style={styles.decorationLine} />
                <View style={styles.iconGroup}>
                  <Ionicons name="airplane-outline" size={16} color="#4ECDC4" style={styles.decorIcon} />
                  <Ionicons name="heart-outline" size={20} color="#FF7B54" />
                  <Ionicons name="camera-outline" size={16} color="#4ECDC4" style={styles.decorIcon} />
                </View>
                <View style={styles.decorationLine} />
              </View>

              {/* Mensagem inspiradora */}
              <Text style={styles.inspirationalText}>
                "Cada viagem em família é um capítulo especial da nossa história" ✈️
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2'
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
     paddingTop: 40,
   
    zIndex: 3
  },
  logoImage: {
    width: 220,
    height: 220,
    position: 'absolute',
    top: -150,

    
    
    
  },
  slogan: {
    fontSize: 26,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontWeight: '700'

  },
  formContainer: {
    flex: 1,
    paddingTop: 32
  },
  form: {
    backgroundColor: '#FEFEFE',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 40,
    paddingHorizontal: 32,
    paddingBottom: 40,
    minHeight: '100%',
    marginTop: -60,
    zIndex: 2,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: -6
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif'
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  inputContainer: {
    marginBottom: 24
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    shadowColor: 'rgba(74, 144, 226, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  inputIcon: {
    marginRight: 15
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  button: {
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 28,
    shadowColor: '#FF7B54',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingIcon: {
    marginRight: 12,
    transform: [{ rotate: '45deg' }]
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif'
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap'
  },
  signupText: {
    fontSize: 16,
    color: '#5A6C7D',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  signupLink: {
    marginLeft: 4
  },
  signupLinkText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif'
  },
  decorationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    marginBottom: 24
  },
  decorationLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    marginHorizontal: 20
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  decorIcon: {
    marginHorizontal: 8
  },
  inspirationalText: {
    fontSize: 14,
    color: '#7B8794',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-BookOblique' : 'sans-serif'
  },
  topImage: {
  width: '100%',
  height: 160, // ajuste conforme necessário
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  overflow: 'hidden',
  marginBottom: 20
},
headerBackground: {
  width: '100%',
  height: 260, // ajuste conforme necessário
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 60,
  paddingHorizontal: 32,
  paddingBottom: 0,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  overflow: 'hidden',
  position: 'relative'
},
headerContent: {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // opcional: leve escurecimento para legibilidade
  paddingVertical: 20,
  paddingHorizontal: 10,
  borderRadius: 16
},

topImageBackground: {
  width: '100%',
  height: 320, // altura maior para invadir o formulário
  justifyContent: 'flex-end', // posiciona conteúdo na parte inferior da imagem
  position: 'relative',
  zIndex: 1
},
topOverlay: {
  ...StyleSheet.absoluteFillObject,
  
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  zIndex: 1
},
topContent: {
  paddingHorizontal: 32,
  paddingBottom: 40,
  alignItems: 'center',
  zIndex: 2
},


});

