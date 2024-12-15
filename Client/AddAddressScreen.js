import React, { createContext, useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Postcode from "@actbase/react-daum-postcode";


export default function AddAddressScreen({ navigation, route }) {
  const [postcode, setPostcode] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddressSelect = (data) => {
    const defaultAddress =
      data.buildingName && data.buildingName !== "N"
        ? data.buildingName
        : data.apartment && data.apartment !== "N"
        ? data.apartment
        : "";
    setPostcode(data.zonecode);
    setNewAddress(`${data.address} ${defaultAddress}`.trim());
    setModalVisible(false); // Close the modal
  };

  const handleAddAddress = () => {
    if (!newAddress) {
      alert('주소를 입력해주세요.');
      return;
    }
    navigation.navigate('CarpoolRegister', {
      addressData: {
        default_address: newAddress,
        isStart: route.params.isStart,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주소 입력</Text>

      {/* Postcode Input */}
      <TouchableOpacity
        style={[styles.input, styles.button]}
        onPress={() => setModalVisible(true)}
      >
        <Text>{postcode || "우편번호 찾기"}</Text>
      </TouchableOpacity>

      {/* New Address Input */}
      <TextInput
        style={styles.input}
        placeholder="주소"
        value={newAddress}
        editable={false}
      />

      {/* Detailed Address Input */}
      <TextInput
        style={styles.input}
        placeholder="상세 주소"
        value={detailedAddress}
        onChangeText={setDetailedAddress}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
        <Text style={styles.saveButtonText}>저장하기</Text>
      </TouchableOpacity>

      {/* Postcode Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Postcode
            style={styles.postcode}
            jsOptions={{ animation: true }}
            onSelected={handleAddressSelect}
            onError={(error) => console.error("Postcode Error:", error)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4865C0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  postcode: {
    width: "100%",
    height: "100%",
  },
});
