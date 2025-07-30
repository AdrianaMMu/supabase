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

export default function ChildAgeInput({ relato, setRelato }: Props) {
  const [valor, setValor] = useState('');
  const [unidade, setUnidade] = useState<'anos' | 'meses'>('anos');

  const adicionarIdade = () => {
    const numero = parseInt(valor, 10);
    if (!isNaN(numero) && numero >= 0 && numero <= 200) {
      const idadeEmMeses = unidade === 'anos' ? numero * 12 : numero;
      setRelato({
        ...relato,
        child_ages: [...relato.child_ages, idadeEmMeses],
      });
      setValor('');
    }
  };

  const removerIdade = (index: number) => {
    const novaLista = [...relato.child_ages];
    novaLista.splice(index, 1);
    setRelato({ ...relato, child_ages: novaLista });
  };

  const formatarIdade = (meses: number): string => {
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    const anos = Math.floor(meses / 12);
    const restoMeses = meses % 12;
    if (restoMeses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${restoMeses} ${restoMeses === 1 ? 'mês' : 'meses'}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>👶 Idade da(s) criança(s)</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="number-pad"
          placeholder={unidade === 'anos' ? 'Ex: 3' : 'Ex: 18'}
          placeholderTextColor="#9B9B9B"
        />

        <TouchableOpacity onPress={() => setUnidade(unidade === 'anos' ? 'meses' : 'anos')}>
          <Text style={styles.toggle}>
            {unidade === 'anos' ? '🔁 Anos' : '🔁 Meses'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={adicionarIdade} style={styles.addButton}>
          <Text style={styles.addText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {relato.child_ages.length > 0 && (
        <View style={styles.chipRow}>
          {relato.child_ages.map((idade, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{formatarIdade(idade)}</Text>
              <TouchableOpacity onPress={() => removerIdade(index)}>
                <Text style={styles.removeIcon}>✖</Text>
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
  toggle: {
    fontSize: 14,
    color: '#7B8794',
    fontWeight: '500',
    paddingHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 8,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  removeIcon: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});
