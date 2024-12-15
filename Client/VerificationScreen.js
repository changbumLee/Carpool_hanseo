import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

export default function VerificationScreen({ route, navigation }) {
    const { username, email } = route.params; // 전달된 username과 email
    const [verificationCode, setVerificationCode] = useState('');

    const handleVerification = async () => {
        try {
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, verificationCode }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('인증 성공', '계정이 활성화되었습니다.');
                navigation.replace('Main'); // 로그인 화면으로 이동
            } else {
                Alert.alert('인증 실패', data.message || '잘못된 인증 코드입니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/resendCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('인증 코드 재전송 성공', '새 인증 코드가 이메일로 발송되었습니다.');
            } else {
                Alert.alert('재전송 실패', data.message || '새 인증 코드를 요청할 수 없습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>인증 코드 입력</Text>
            <TextInput
                style={styles.input}
                placeholder="인증 코드"
                value={verificationCode}
                onChangeText={setVerificationCode}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerification}>
                <Text style={styles.buttonText}>인증하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
                <Text style={styles.resendButtonText}>인증 코드 재전송</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f8ff', alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30 },
    input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
    button: { width: '100%', height: 50, backgroundColor: '#4CAF50', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    resendButton: { width: '100%', height: 50, backgroundColor: '#FFA500', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resendButtonText: { color: '#fff', fontSize: 16 },
});
