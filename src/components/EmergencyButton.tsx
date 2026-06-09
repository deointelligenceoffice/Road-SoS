import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { sendSmsToEmergency } from '../services/smsService';

interface EmergencyButtonProps {
  service: string;
  phoneNumber: string;
  color: string;
}

const EmergencyButton = ({ service, phoneNumber, color }: EmergencyButtonProps) => {
  const onPress = async () => {
    const result = await sendSmsToEmergency(service, phoneNumber);
    if (result.success) {
      Alert.alert('Help requested', `A ${service} request was sent successfully.`);
    } else {
      Alert.alert('Action needed', `Unable to send SMS on this device. Please call ${phoneNumber} manually.`);
    }
  };

  return (
    <View style={styles.buttonWrapper}>
      <Button mode="contained" buttonColor={color} onPress={onPress} style={styles.button}>
        Request {service}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    gap: 8,
    marginBottom: 8
  },
  label: {
    color: '#ffffff',
    fontWeight: '700'
  },
  button: {
    paddingVertical: 8
  }
});

export default EmergencyButton;
