import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { storage } from './FirebaseConfig'; // 스토리지 사용
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // 스토리지 사용


export default function SignupScreen({ navigation }) { // navigation 추가
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [hint, setHint] = useState('');
    const [hintAnswer, setHintAnswer] = useState('');
    const [email, setEmail] = useState('');
    const [vehicle, setVehicle] = useState('무'); // 초기값을 '무'로 설정 (차량 유무)
    const [vehicleNumber, setVehicleNumber] = useState(''); // 차량 넘버
    const [vehicleType, setVehicleType] = useState(''); // 차량 종류
    const [licenseImage, setLicenseImage] = useState(null); // 라이센스 사진 링크

    const [modalVisible, setModalVisible] = useState(false);    // 모달 관련 함수 

    // handleSignup에서 사진 업로드와 회원가입 진행
    const handleSignup = async () => {
        try {
            const signupData = {
                username,
                password,
                birthdate,
                phone,
                name,
                hint,
                hintAnswer,
                email,
                vehicle,
            };

            if (vehicle === '유') {
                if (!licenseImage) {
                    Alert.alert('실패!', '면허증 사진을 업로드해주세요.');
                    return;
                }

                // Firebase에 사진 업로드
                try {
                    const uploadedUrl = await uploadImageToFirebase(licenseImage); // Firebase 업로드
                    signupData.vehicleNumber = vehicleNumber;
                    signupData.vehicleType = vehicleType;
                    signupData.licenseImage = uploadedUrl; // 업로드된 URL 추가
                } catch (error) {
                    console.error('Error during image upload:', error);
                    Alert.alert('실패!', '면허증 사진 업로드 중 오류가 발생했습니다.');
                    return;
                }
            }

            // 서버로 데이터 전송
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('회원가입 성공', '이메일로 인증 코드를 발송했습니다.');
                navigation.navigate('Verification', { username, email });
            } else {
                Alert.alert('회원가입 실패', data.message || '회원가입 중 문제가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
        }
    };


    // Firebase Storage에 사진 업로드 함수
    const uploadImageToFirebase = async (localUri) => {
        try {
            const fileName = localUri.split('/').pop(); // 파일 이름 추출
            const storageRef = ref(storage, `users_licenses/${fileName}`); // Storage 경로 설정

            const response = await fetch(localUri);
            if (!response.ok) throw new Error('Failed to fetch local file');
            const blob = await response.blob(); // 로컬 파일을 Blob으로 변환

            // Firebase에 Blob 업로드
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef); // 업로드된 파일의 URL 가져오기
            console.log('Uploaded URL:', downloadURL);
            return downloadURL;

        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // 카메라로 사진 찍기 (Firebase 업로드 X)
    const pickImageFromCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            setLicenseImage(localUri); // 로컬 URI만 상태에 저장
            Alert.alert('사진 선택 완료', '면허증 사진이 선택되었습니다.');
        }
        setModalVisible(false);
    };

    // 갤러리에서 사진 선택 (Firebase 업로드 X)
    const pickImageFromLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            setLicenseImage(localUri); // 로컬 URI만 상태에 저장
            Alert.alert('사진 선택 완료', '면허증 사진이 선택되었습니다.');
        }
        setModalVisible(false);
    };

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (input) => {
        const digits = input.replace(/\D/g, '');
        const formatted = digits
            .replace(/^(\d{3})(\d{4})(\d{0,4})$/, '$1-$2-$3')
            .replace(/-$/, '');
        setPhone(formatted);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!username || !password || !birthdate || !name || !hint || !hintAnswer || !email) {
                Alert.alert('실패!', '모든 필드를 입력해주세요.');
                return;
            }
            setStep(2);
        }
        else if (step === 2) {
            if (!phone.trim()) {
                Alert.alert('실패!', '전화번호를 입력해주세요.');
                return;
            }
            if (vehicle === '유') {
                if (!licenseImage) {
                    Alert.alert('실패!', '면허증 사진을 업로드해주세요.');
                    return;
                }
                if (!vehicleNumber.trim() || !vehicleType.trim()) {
                    Alert.alert('실패!', '차량 번호와 차종을 입력해주세요.');
                    return;
                }
            }
        }
        if (step == 2) {
            // 모든 조건이 맞으면 이메일 인증으로 이동 
            console.log('모든 정보를 입력하셨습니다. 이메일 인증을 받으러 이동하겠습니다.');
            handleSignup();
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {step === 1 ? (
                    <>
                        <Text style={styles.title}>회원가입</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="아이디"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="생년월일 (YYYY-MM-DD)"
                            value={birthdate}
                            onChangeText={setBirthdate}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="이름"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="이메일"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="아이디 찾기 힌트"
                            value={hint}
                            onChangeText={setHint}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="힌트 정답"
                            value={hintAnswer}
                            onChangeText={setHintAnswer}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>차량 정보 입력</Text>
                        <Text style={styles.label}>차량 유무</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setVehicle('유')}
                            >
                                <View style={styles.radioCircle}>
                                    {vehicle === '유' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>유</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setVehicle('무')}
                            >
                                <View style={styles.radioCircle}>
                                    {vehicle === '무' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>무</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="전화번호 (예: 010-1234-5678)"
                            keyboardType="numeric"
                            value={phone}
                            onChangeText={formatPhoneNumber}
                        />
                        {vehicle === '유' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="차량 번호"
                                    value={vehicleNumber}
                                    onChangeText={setVehicleNumber}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="차종"
                                    value={vehicleType}
                                    onChangeText={setVehicleType}
                                />
                                <Text style={styles.label}>면허증 사진</Text>
                                <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Text style={styles.uploadButtonText}>면허증 업로드</Text>
                                </TouchableOpacity>
                                {licenseImage && (
                                    <Image source={{ uri: licenseImage }} style={styles.imagePreview} />
                                )}
                            </>
                        )}
                    </>
                )}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>다음</Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={pickImageFromCamera}
                            >
                                <MaterialIcons name="camera-alt" size={30} color="#000" />
                                <Text style={styles.modalOptionText}>카메라로 촬영</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={pickImageFromLibrary}
                            >
                                <MaterialIcons name="photo-library" size={30} color="#000" />
                                <Text style={styles.modalOptionText}>사진 선택</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 20 },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30 },
    input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 10, alignSelf: 'flex-start' },
    radioGroup: { flexDirection: 'row', marginBottom: 20 },
    radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' },
    radioText: { fontSize: 16, color: '#000' },
    button: { width: '100%', height: 50, backgroundColor: '#4CAF50', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    uploadButton: { width: '100%', height: 50, backgroundColor: '#008CBA', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    imagePreview: { width: 200, height: 200, marginTop: 20, borderRadius: 10, borderColor: '#ccc', borderWidth: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 15, width: '100%' },
    modalOptionText: { fontSize: 16, color: '#000', marginLeft: 10 },
    modalCancel: { marginTop: 10 },
    modalCancelText: { fontSize: 16, color: '#f00' },
});
