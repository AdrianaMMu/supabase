
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router } from 'expo-router';
import { useAuth, AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GestureHandlerRootView>
    
  );
}

function MainLayout() {
  const { setAuth } = useAuth();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth(session.user);
        router.replace('/(panel)/relato_page/page');
      } else {
        setAuth(null);
        router.replace('/(auth)/signin/page');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signin/page" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup/page" options={{ headerShown: false }} />
      <Stack.Screen name="(panel)/profile/page" options={{ headerShown: false }} />
      <Stack.Screen name="(panel)/relato_page/page" options={{ headerShown: false }} />
      <Stack.Screen name="(panel)/relato_guardado/page" options={{ headerShown: false }} />
      <Stack.Screen name="(panel)/create_relato/page" options={{ headerShown: false }} />
      <Stack.Screen name="relato/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit_relato/[id]" options={{ headerShown: false }} />
    
      
    </Stack>
  );
}
