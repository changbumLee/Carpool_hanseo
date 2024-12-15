import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Dimensions,
    Image,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer'; // 이미지 줌 뷰어

export default function PendingUsersScreen({ route }) {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [adminId, setAdminId] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false); // 승인 모달 상태
    const [isImageModalVisible, setImageModalVisible] = useState(false); // 이미지 줌 모달 상태
    const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 보고 있는 사용자의 순서
    const flatListRef = useRef(null); // FlatList 참조

    const { username } = route.params;

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch(
                    `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getUserId?username=${username}`
                );
                const data = await response.json();
                if (response.ok) {
                    setAdminId(data.id);
                } else {
                    console.error('Failed to fetch user ID:', data.message);
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, [username]);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const response = await fetch(
                    'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/pending-users',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ adminId }),
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setPendingUsers(data);
                } else {
                    console.error('Error fetching pending users:', data.message);
                }
            } catch (error) {
                console.error('Error fetching pending users:', error);
            }
        };

        if (adminId) {
            fetchPendingUsers();
        }
    }, [adminId]);

    const handleImagePress = (imageUri) => {
        setSelectedImage([{ url: imageUri }]); // 이미지 뷰어에 맞는 포맷 설정
        setImageModalVisible(true); // 이미지 줌 모달 열기
    };

    const handleApprove = async (userId) => {
        try {
            const response = await fetch(
                'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/update-approval-status',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: userId, is_approved: 1 }), // 승인
                }
            );

            if (response.ok) {
                console.log(`User ID ${userId} 승인 완료`);
                setPendingUsers((prev) =>
                    prev.filter((user) => user.id !== userId) // 승인된 사용자 목록에서 제거
                );
            } else {
                console.error('승인 실패:', await response.json());
            }
        } catch (error) {
            console.error('승인 요청 중 오류:', error);
        }
    };

    const handleReject = async (userId) => {
        try {
            const response = await fetch(
                'https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/update-approval-status',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: userId, is_approved: -1 }), // 취소
                }
            );

            if (response.ok) {
                console.log(`User ID ${userId} 취소 완료`);
                setPendingUsers((prev) =>
                    prev.filter((user) => user.id !== userId) // 취소된 사용자 목록에서 제거
                );
            } else {
                console.error('취소 실패:', await response.json());
            }
        } catch (error) {
            console.error('취소 요청 중 오류:', error);
        }
    };

    const renderPendingUser = ({ item }) => (
        <View style={styles.userCard}>
            <TouchableOpacity onPress={() => handleImagePress(item.license_path)}>
                <Image
                    source={{ uri: item.license_path }}
                    style={styles.licenseImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            <Text style={styles.userText}>이름: {item.name}</Text>
            <Text style={styles.userText}>생년월일: {item.birthdate}</Text>
            <Text style={styles.userText}>ID: {item.id}</Text>
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(item.id)}
                >
                    <Text style={styles.buttonText}>승인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(item.id)}
                >
                    <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>승인 대기 중인 사용자 수</Text>
            <Text style={styles.count}>{pendingUsers.length}명</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>승인하러 가기</Text>
            </TouchableOpacity>

            {/* 승인 대기 사용자 모달 */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={pendingUsers}
                        renderItem={renderPendingUser}
                        keyExtractor={(item, index) => String(index)}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={({ viewableItems }) => {
                            if (viewableItems.length > 0) {
                                setCurrentIndex(viewableItems[0].index + 1); // 현재 아이템의 인덱스 업데이트
                            }
                        }}
                        viewabilityConfig={{
                            viewAreaCoveragePercentThreshold: 50, // 50% 이상 보일 때 업데이트
                        }}
                    />
                    {/* 현재 순서 표시 */}
                    <Text style={styles.pagination}>
                        {currentIndex} / {pendingUsers.length}
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* 이미지 줌 모달 */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <ImageViewer
                    imageUrls={selectedImage} // [{ url: '이미지 URL' }]
                    onCancel={() => setImageModalVisible(false)} // 닫기 핸들러
                    enableSwipeDown={true} // 아래로 스와이프하여 닫기
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    count: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userCard: {
        width: Dimensions.get('window').width - 40,
        margin: 20,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        alignItems: 'center',
    },
    licenseImage: {
        width: Dimensions.get('window').width - 45,
        height: Dimensions.get('window').height / 2.2,
        marginBottom: 20,
    },
    userText: {
        fontSize: 18,
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    approveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    closeButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
    },
    pagination: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
});
