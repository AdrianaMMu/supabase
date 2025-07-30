import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Relato } from '@/src/types';

type Props = {
  relato: Relato;
  setRelato: React.Dispatch<React.SetStateAction<Relato>>;
};

export default function LocationInput({ relato, setRelato }: Props) {
  const [local, setLocal] = useState('');

  const adicionarLocal = () => {
    const nome = local.trim();
    if (nome.length > 0 && !relato.locations.includes(nome)) {
      setRelato({
        ...relato,
        locations: [...relato.locations, nome],
      });
      setLocal('');
    }
  };

  const removerLocal = (index: number) => {
    const novaLista = [...relato.locations];
    novaLista.splice(index, 1);
    setRelato({ ...relato, locations: novaLista });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📍 Lugares visitados</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={local}
          onChangeText={setLocal}
          placeholder="Nome de uma cidade, ilha ou região"
          placeholderTextColor="#9B9B9B"
        />
        <TouchableOpacity onPress={adicionarLocal} style={styles.addButton}>
          <Text style={styles.addText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {relato.locations.length > 0 && (
        <View style={styles.list}>
          {relato.locations.map((lugar, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.pin}>📍</Text>
              <Text style={styles.text}>{lugar}</Text>
              <TouchableOpacity onPress={() => removerLocal(index)}>
                <Text style={styles.remove}>✖</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pin: {
    fontSize: 16,
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    flex: 1,
    color: '#2C3E50',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  remove: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
});
