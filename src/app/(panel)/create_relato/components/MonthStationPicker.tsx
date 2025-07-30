import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Relato } from '@/src/types';

type Props = {
  relato: Relato;
  setRelato: React.Dispatch<React.SetStateAction<Relato>>;
};

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const estacoes = [
  { nome: 'Primavera', emoji: '🌸' },
  { nome: 'Verão', emoji: '☀️' },
  { nome: 'Outono', emoji: '🍁' },
  { nome: 'Inverno', emoji: '❄️' },
];

export default function MonthStationPicker({ relato, setRelato }: Props) {
  const selecionarMes = (month: string) => {
    setRelato({ ...relato, month });
  };

  const selecionarEstacao = (nome: string, emoji: string) => {
    setRelato({ ...relato, season: nome, emojiseason: emoji });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🗓️ Mês da viagem</Text>
      <View style={styles.grid}>
        {meses.map((mes) => (
          <TouchableOpacity key={mes} onPress={() => selecionarMes(mes)}>
            <View style={[
              styles.chip,
              relato.month === mes && styles.chipSelecionado
            ]}>
              <Text style={[
                styles.chipText,
                relato.month === mes && styles.chipTextSelecionado
              ]}>
                {mes}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>🌦️ Estação do ano</Text>
      <View style={styles.grid}>
        {estacoes.map((e) => (
          <TouchableOpacity key={e.nome} onPress={() => selecionarEstacao(e.nome, e.emoji)}>
            <View style={[
              styles.chipEstacao,
              relato.season === e.nome && styles.chipSelecionado
            ]}>
              <Text style={styles.emoji}>{e.emoji}</Text>
              <Text style={[
                styles.chipText,
                relato.season === e.nome && styles.chipTextSelecionado
              ]}>
                {e.nome}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {relato.month && relato.season && (
        <View style={styles.resumo}>
          <Text style={styles.resumoText}>
            {relato.month} — {relato.season} {relato.emojiseason}
          </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipEstacao: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipSelecionado: {
  backgroundColor: '#4A90E2',
  borderColor: '#4A90E2',
  shadowColor: '#4A90E2',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 2,
},
  chipText: {
    fontSize: 14,
    color: '#435160',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  chipTextSelecionado: {
    color: 'white',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  resumo: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 12,
  },
  resumoText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
});

