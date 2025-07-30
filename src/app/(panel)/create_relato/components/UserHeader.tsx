import { View, TextInput, Text, Image, StyleSheet, Platform } from 'react-native';
import { Relato, CustomUser } from 'src/types';

type Props = {
  user: CustomUser;
  relato: Relato;
  setRelato: React.Dispatch<React.SetStateAction<Relato>>;
};

export default function UserHeader({ user, relato, setRelato }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: user?.avatar_url ?? 'https://via.placeholder.com/100/FFFFFF/4A90E2?text=👤',
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <TextInput
          placeholder="Título da Viagem"
          placeholderTextColor="#9B9B9B"
          value={relato.title}
          onChangeText={(text) => setRelato({ ...relato, title: text })}
          style={styles.titleInput}
        />
        <Text style={styles.name}>por {user?.name ?? 'Nome do usuário'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  name: {
    fontSize: 14,
    color: '#7B8794',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
});
