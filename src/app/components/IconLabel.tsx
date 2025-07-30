import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import CountryFlag from 'react-native-country-flag';

type IconLabelProps = {
  label: string;
  value?: string;
  countryCode?: string; // Novo campo ISO do país (ex: 'br', 'fr', 'jp')
  editable?: boolean;
  onChange?: (text: string) => void;
};

const IconLabel = ({ label, value, countryCode, editable = false, onChange }: IconLabelProps) => {
  return (
    <View style={styles.container}>
      {countryCode && (
        <CountryFlag isoCode={countryCode} size={24} style={styles.flag} />
      )}
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Digite aqui..."
          />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
      </View>
    </View>
  );
};

export default IconLabel;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  flag: {
    marginRight: 12
  },
  textBlock: {
    flex: 1
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333'
  },
  value: {
    fontSize: 14,
    marginTop: 4
  },
  input: {
    fontSize: 14,
    marginTop: 4,
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  }
});
