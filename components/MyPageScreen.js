// 면허입력을 눌렀을때 이미 대기중이면 오류 출력
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Switch, TouchableOpacity, ScrollView, Modal, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Profile } from '../assets/Frame';
export default function MyPageScreen({ id, userid, password }) {
  const navigation = useNavigation();
  const [uid, setUid] = useState('user123');
  const [nickName, setNickName] = useState('닉네임');
  // const [email, setEmail] = useState('user@example.com');
  const [isChatNotificationOn, setIsChatNotificationOn] = useState(false);
  const [isSchoolNotificationOn, setIsSchoolNotificationOn] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [temperature, setTemperature] = useState(36.5); // 실제 온도 값을 넣으려면 상태값을 변경
  const [permission, setPermission] = useState(null); // 유저의 권한 저장 

  // 권한 불러오기 
  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const response = await fetch(
          'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/get-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        }
        );

        const data = await response.json();
        if (response.ok) {
          setPermission(data.permission); // API로부터 permission 값 설정
        } else {
          console.error('Failed to fetch permission:', data.message);
        }
      } catch (error) {
        console.error('Error fetching permission:', error);
      }
    };

    fetchPermission();
  }, [id]); // userId가 변경될 때 다시 실행

  // 승인 요청 상태 확인
  const handleApprovalRequest = async () => {
    try {
      const response = await fetch(
        `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/get-approval-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error checking request status:', errorData.message);
        Alert.alert('오류', errorData.message || '승인 상태 확인 중 문제가 발생했습니다.');
        return;
      }

      const data = await response.json();
      console.log('서버 응답 데이터:', data); // 서버에서 받은 응답을 출력

      if (data.isPending) {
        // 승인 대기 중인 경우
        Alert.alert('알림', data.message || '이미 요청을 하셨습니다. 승인을 기다려주세요.');
      } else {
        // 요청이 없는 경우 또는 직전에 요청이 거부된 상태
        Alert.alert('알림', data.message || '승인 요청이 없습니다.');
        navigation.navigate('LicenseVerificationScreen', { id, userid, password });
      }
    } catch (error) {
      console.error('Error fetching request status:', error);
      Alert.alert('오류', '승인 상태 확인 중 문제가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인', onPress: () => {
          console.log('Logged out');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      },
    ]);
  };

  const handleAccountDeletion = () => {
    Alert.alert('회원탈퇴', '정말로 회원탈퇴 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인', onPress: async () => {
          try {
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/deleteUser', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userid: id }), // userid는 로그인된 유저의 고유 ID== 지금 전달을 어떻게 할까 고민
            });

            if (response.ok) {
              const data = await response.json();
              console.log(data.message);
              Alert.alert('회원탈퇴 완료', '회원 탈퇴가 성공적으로 완료되었습니다.');
              navigation.navigate('Main');
            } else {
              const errorData = await response.json();
              console.error('회원 탈퇴 실패:', errorData.message);
            }
          } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '회원 탈퇴 중 문제가 발생했습니다.');
          }
        }
      },
    ]);
  };

  const handleChangePassword = async () => {
    // 현재 비밀번호를 기존 비밀번호와 비교
    if (currentPassword !== password) {
      Alert.alert('오류', '현재 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/changePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, newPassword: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.');
        setShowPasswordModal(false); // 모달 닫기
        setCurrentPassword(''); // 입력 필드 초기화
        setNewPassword('');
      } else {
        Alert.alert('오류', data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다.');
    }
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
  };


  const handleClearCache = () => {
    Alert.alert('캐시 삭제 완료', '캐시가 성공적으로 삭제되었습니다.');
  };

  const handleLicenseVerification = () => {
    // Frame.js에서 운전자 인증을 클릭하면 받아와서 Mypage.js에서 처리 
    handleApprovalRequest();  // 이미 인증 신청을 한 사용자인지 판단

  };

  return (
    <ScrollView style={styles.container}>
      <Profile username={userid} permission={permission} onVerify={handleLicenseVerification} />
      {/* Actions Section
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>관리비</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>고객센터</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>아파트캐시</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>이벤트</Text>
        </TouchableOpacity>
      </View> */}

      {/* 계정 관리 */}
      <Text style={styles.categoryTitle}>계정</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HistoryListScreen', { id, permission })}>
        <Text style={styles.menuText}>이용기록</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleOpenPasswordModal}>
        <Text style={styles.menuText}>비밀번호 변경</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, { color: 'red' }]} onPress={handleLogout}>
        <Text style={[styles.menuText, { color: 'red' }]}>로그아웃</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleAccountDeletion}>
        <Text style={styles.menuText}>회원탈퇴</Text>
      </TouchableOpacity>

      {/* 비밀번호 변경 모달 */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.modalButtons}>
              <Button title="취소" onPress={() => setShowPasswordModal(false)} />
              <Button title="변경" onPress={handleChangePassword} />
            </View>
          </View>
        </View>
      </Modal>

      {/* 알림 설정 */}
      <Text style={styles.categoryTitle}>알림</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>채팅 알림</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          // thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          value={isChatNotificationOn}
          onValueChange={(value) => setIsChatNotificationOn(value)}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>학교 공지사항</Text>
        <Switch
          style={styles.switchbutton}
          value={isSchoolNotificationOn}
          onValueChange={(value) => setIsSchoolNotificationOn(value)}
        />
      </View>

      {/* 기타 설정 */}
      <Text style={styles.categoryTitle}>기타</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('건의/제안사항 페이지로 이동')}>
        <Text style={styles.menuText}>건의/제안사항</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
        <Text style={styles.menuText}>캐시 삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Opensource')}>
        <Text style={styles.menuText}>오픈소스 라이브러리</Text>
      </TouchableOpacity>

      {/*버전 정보*/}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>버전 1.0.0</Text>
        <Text style={styles.versionText}>ⓒ 2024 Database CapStone</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#c4c4c4',
    borderRadius: 25,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileLabel: { fontSize: 16, color: '#555', marginBottom: 4 },
  temperatureContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B', // 온도에 따라 색상 변경 가능 (예: 높은 온도일 때 빨간색)
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  temperatureText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: { marginTop: 20, borderTopWidth: 1, borderColor: '#ddd', paddingTop: 16 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileValue: {
    fontSize: 16,
    color: '#555',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4865C0',
    marginVertical: 15,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  dangerMenu: { borderColor: '#f44336' },
  dangerText: { color: '#f44336' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});
