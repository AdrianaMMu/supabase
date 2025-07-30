
import {View, Text, StyleSheet, TextInput,Pressable,Alert, ActivityIndicator} from 'react-native';
import colors from '../../constants/colors';


export default function Index() {
        

    return (
        <View style={styles.container}>
        <ActivityIndicator size={44} color={colors.lightSky} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 54,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.orangeEnd
    },

   
});





