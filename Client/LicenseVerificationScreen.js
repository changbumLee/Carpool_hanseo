// 차량 정보 입력을 필수로 설정한 업데이트된 코드

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { uploadImageToFirebase, deleteImageFromFirebase } from './FirebaseConfig'; // Firebase Storage
import { useNavigation } from '@react-navigation/native'; // Navigation 훅 가져오기

export default function LicenseUpload({ route }) {
    const [licenseImage, setLicenseImage] = useState(null); // 면허증 이미지 URI 상태
    const [modalVisible, setModalVisible] = useState(false); // 모달 상태
    const [vehicleNumber, setVehicleNumber] = useState(''); // 차량 번호
    const [vehicleType, setVehicleType] = useState(''); // 차량 종류
    const { id, userid, password } = route?.params;
    const navigation = useNavigation(); // navigation 객체 가져오기

    // 카메라로 사진 찍기
    const pickImageFromCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            setLicenseImage(localUri); // 로컬 URI 저장
            Alert.alert('사진 선택 완료', '면허증 사진이 선택되었습니다.');
        }
        setModalVisible(false); // 모달 닫기
    };

    // 갤러리에서 사진 선택
    const pickImageFromLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            setLicenseImage(localUri); // 로컬 URI 저장
            Alert.alert('사진 선택 완료', '면허증 사진이 선택되었습니다.');
        }
        setModalVisible(false); // 모달 닫기
    };

    // 제출하기 버튼 클릭 시 처리 - 차량 정보와 면허증 저장
    const handleSubmit = async () => {
        if (!licenseImage || !vehicleNumber.trim() || !vehicleType.trim()) {
            Alert.alert("오류", "면허증 사진, 차량 번호 및 차종을 모두 입력하세요!");
            return;
        }

        let uploadedUrl = null;
        const fileName = licenseImage.split("/").pop();

        try {
            // Firebase에 이미지 업로드
            uploadedUrl = await uploadImageToFirebase(licenseImage);

            // 서버로 데이터 전송
            const response = await fetch("https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/license-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    license_path: uploadedUrl,
                    vehicle_number: vehicleNumber,
                    vehicle_type: vehicleType,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("성공", "면허증과 차량 정보가 성공적으로 제출되었습니다!");
                navigation.navigate('HomeScreen', { id, userid, password }); // 마이페이지로 이동
            } else {
                throw new Error(data.message || "면허증 제출에 실패했습니다.");
            }
        } catch (error) {
            console.error("제출 중 오류 발생:", error);

            // 서버 요청 실패 시 Firebase 이미지 삭제
            if (uploadedUrl) {
                await deleteImageFromFirebase(fileName);
            }

            Alert.alert("오류", "제출 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>면허증 및 차량 정보 업로드</Text>
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
            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.uploadButtonText}>면허증 업로드</Text>
            </TouchableOpacity>
            {licenseImage && (
                <>
                    <Image source={{ uri: licenseImage }} style={styles.imagePreview} />
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>제출하기</Text>
                    </TouchableOpacity>
                </>
            )}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
    uploadButton: { width: '80%', height: 50, backgroundColor: '#4CAF50', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    imagePreview: { width: 250, height: 250, marginTop: 20, borderRadius: 10, borderColor: '#ccc', borderWidth: 1 },
    submitButton: { width: '80%', height: 50, backgroundColor: '#008CBA', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 15, width: '100%' },
    modalOptionText: { fontSize: 16, color: '#000', marginLeft: 10 },
    modalCancel: { marginTop: 10 },
    modalCancelText: { fontSize: 16, color: '#f00' },
});
