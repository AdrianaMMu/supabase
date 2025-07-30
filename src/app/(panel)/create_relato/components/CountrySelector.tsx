import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CountryPicker from 'react-native-country-picker-modal';
import CountryFlag from 'react-native-country-flag';
import { Relato } from '@/src/types';

type CountryItem = {
  code: string;
  name: string;
};

type Props = {
  relato: Relato;
  setRelato: React.Dispatch<React.SetStateAction<Relato>>;
};

export default function CountrySelector({ relato, setRelato }: Props) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (country: any) => {
    const novoPais: CountryItem = {
      code: country.cca2,
      name: country.name,
    };

    const jaExiste = relato.countries.some((p) => p.code === novoPais.code);
    if (!jaExiste) {
      setRelato({ ...relato, countries: [...relato.countries, novoPais] });
    }
  };

  const handleRemove = (index: number) => {
    const novaLista = [...relato.countries];
    novaLista.splice(index, 1);
    setRelato({ ...relato, countries: novaLista });
  };

  return (
    <View style={styles.container}>
      {/* Card principal */}
      <View style={styles.card}>
        {/* Header do card */}
        <View style={styles.cardHeader}>
          <View style={styles.labelContainer}>
            <Ionicons name="earth" size={20} color="#4A90E2" />
            <Text style={styles.label}>Países Visitados</Text>
          </View>
          <Text style={styles.helperText}>
            Selecione os países da sua aventura
          </Text>
        </View>

        {/* Botão de seleção */}
        <TouchableOpacity 
          onPress={() => setVisible(true)} 
          style={styles.selectButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.selectButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.selectText}>Adicionar País</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.8)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Lista de países selecionados */}
        {relato.countries.length > 0 && (
          <View style={styles.selectedContainer}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>
                {relato.countries.length === 1 ? '1 país selecionado' : `${relato.countries.length} países selecionados`}
              </Text>
            </View>
            
            <View style={styles.selectedRow}>
              {relato.countries.map((pais, index) => (
                <View key={index} style={styles.chip}>
                  <CountryFlag 
                    isoCode={pais.code} 
                    size={18} 
                    style={styles.flagSmall} 
                  />
                  <Text style={styles.chipText}>{pais.name}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemove(index)}
                    style={styles.removeButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Country Picker Modal */}
      {visible && (
        <CountryPicker
          visible
          withFilter
          withFlag
          onClose={() => setVisible(false)}
          onSelect={(country) => {
            handleSelect(country);
            setVisible(false);
          }}
          countryCode="BR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  },
  helperText: {
    fontSize: 14,
    color: '#7B8794',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  selectButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  selectedContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 104, 238, 0.1)',
  },
  selectedHeader: {
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B68EE',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  flagSmall: {
    marginRight: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 8,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  removeButton: {
    padding: 2,
  },
});