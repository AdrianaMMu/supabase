  import { useState } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image
  } from 'react-native';
  import { router } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  import { LinearGradient } from 'expo-linear-gradient';
  import { supabase } from '../../../lib/supabase';
  import { ImageBackground } from 'react-native';
  import { useRouter } from 'expo-router';

  export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    
    async function handleSignUp() {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      Alert.alert(
        'Bem-vindos à família! 🎉',
        'Conta criada com sucesso! Agora vocês podem começar a guardar suas memórias especiais.',
        [
          {
            text: 'Vamos começar!',
            onPress: () => router.replace('/(auth)/signin/page')
          }
        ]
      );
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
            {/* Background com gradiente */}
            <LinearGradient
              colors={['#4A90E2', '#7B68EE', '#87CEEB']}
              style={styles.backgroundGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Header */}       
              <ImageBackground
        source={require('@/assets/images/airport.png')}
        style={styles.topImageBackground}
        resizeMode="cover"
      >
        {/* Sombra por cima da imagem */}
        <LinearGradient
          colors={[
            'rgba(74,144,226,0.4)',
            'rgba(123,104,238,0.4)',
            'rgba(135,206,235,0.4)'
          ]}
          style={styles.topOverlay}
          pointerEvents="none"
        />

        <SafeAreaView style={styles.topSafeArea}>
          {/* Botão de voltar */}
          <TouchableOpacity
            onPress={() => {
              console.log('Back pressed')
              router.push('/(auth)/signin/page')
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* Texto e subtítulo */}
          <View style={styles.topContent}>
            <Text style={styles.slogan}>Junte-se à Família!</Text>
            <Text style={styles.subtitle}>
              Crie sua conta e comece a escrever as memórias que inspirarão outras famílias
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>


            {/* Formulário */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <Text style={styles.welcomeText}>Primeira aventura? ✈️</Text>
                <Text style={styles.welcomeSubtext}>
                  Preencha os dados abaixo e ganhe seu passaporte para o mundo das memórias familiares
                </Text>

                {/* Campo Nome */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Seu nome</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="people-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Coloque seu nome e apelido"
                      placeholderTextColor="#9B9B9B"
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Campo Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email de Contato</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Seu melhor email para receber novidades"
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
                  <Text style={styles.inputLabel}>Senha Segura</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Crie uma senha forte para proteger suas memórias"
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

                {/* Botão de Cadastro */}
                <Pressable 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleSignUp}
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
                      {loading ? 'Criando sua conta...' : 'Iniciar Jornada'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {/* Decoração */}
                <View style={styles.decorationContainer}>
                  <View style={styles.decorationLine} />
                  <View style={styles.iconGroup}>
                    <Ionicons name="camera-outline" size={16} color="#4ECDC4" style={styles.decorIcon} />
                    <Ionicons name="heart-outline" size={20} color="#FF7B54" />
                    <Ionicons name="map-outline" size={16} color="#4ECDC4" style={styles.decorIcon} />
                  </View>
                  <View style={styles.decorationLine} />
                </View>

                {/* Mensagem inspiradora */}
                <View style={styles.motivationContainer}>
                  <Text style={styles.motivationText}>
                    💡 <Text style={styles.motivationBold}>Dica:</Text> Suas primeiras memórias podem inspirar centenas de outras famílias a criar momentos especiais juntas!
                  </Text>
                </View>
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
    paddingBottom: 32
  },
  
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  logoIcon: {
    transform: [{ rotate: '15deg' }],
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  slogan: {
    fontSize: 26,
    color: 'white',
    marginBottom: 20,
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
    marginBottom: 100,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontWeight: '700'

  },

  formContainer: {
    flex: 1,
    paddingTop: 24
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
    marginBottom: 36,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  inputContainer: {
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'
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
    marginTop: 20,
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
  decorationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
  motivationContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4'
  },
  motivationText: {
    fontSize: 14,
    color: '#5A6C7D',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif'
  },
  motivationBold: {
    fontWeight: '700',
    color: '#4A90E2'
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

backButtonContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(27, 145, 177, 0.85)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
   topImageBackground: {
    width: '100%',
    height: 300,      // ajuste à sua necessidade
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topSafeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    zIndex: 10,
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,   // para não ficar por baixo do botão
  },
});