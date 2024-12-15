import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './Client/MainScreen'; // MainScreen 경로 확인
import SignupScreen from './Client/SignupScreen'; // SignupScreen 경로 확인
import FindIdPasswordScreen from './Client/FindIdPasswordScreen'; // FindIdPasswordScreen 경로 확인
import HomeScreen from './Client/HomeScreen'; // HomeScreen 경로 확인
import ReSetPasswordScreen from './Client/ReSetPasswordScreen'; // 경로 수정
import CarpoolRecruitPage from './components/CarpoolRegisterScreen';
import CarpoolSearchPage from './components/CarpoolSearchScreen';
import VerificationScreen from './Client/VerificationScreen';
import AddAddressScreen from './Client/AddAddressScreen';
import AdminScreen from './Client/AdminScreen'; // AdminScreen 추가
import LicenseVerificationScreen from './Client/LicenseVerificationScreen'; // 라이센스 인증 경로 추가 
import HistoryListScreen from './Client/HistoryListScreen';



const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }} // 메인 화면은 헤더를 숨김
        />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{ title: '회원가입' }} // 회원가입 화면 제목 설정
        />
        <Stack.Screen name="Verification" component={VerificationScreen} />

        <Stack.Screen
          name="FindIdPasswordScreen"
          component={FindIdPasswordScreen}
          options={{ title: '아이디 찾기' }} // 아이디 찾기 화면 제목 설정
        />
        <Stack.Screen
          name="ReSetPasswordScreen" // 이름 수정
          component={ReSetPasswordScreen} // 여기 수정
          options={{ title: '비밀번호 재설정' }} // 비밀번호 재설정 화면 제목 설정
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: '홈', headerShown: false }} // 홈 화면 제목 설정
        />
        <Stack.Screen
          name="AdminScreen"
          component={AdminScreen}
          options={{ title: '관리자 화면', headerShown: false }} // 어드민 화면 추가
        />
        <Stack.Screen
          name="AddAddressScreen"
          component={AddAddressScreen}
          options={{ title: "Add Address" }}
        />
        <Stack.Screen
          name="LicenseVerificationScreen" // 오타 수정
          component={LicenseVerificationScreen}
          options={{ title: "운전 면허 인증 화면" }}
        />
        <Stack.Screen
          name="HistoryListScreen"
          component={HistoryListScreen}
          options={{ title: '이용 기록' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

