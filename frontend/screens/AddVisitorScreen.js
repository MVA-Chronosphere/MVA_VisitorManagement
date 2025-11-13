import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import ModalSelector from "react-native-modal-selector";
import apiClient from "../api/apiClient";

export default function AddVisitorScreen({ navigation }) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [cardUrl, setCardUrl] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const [notifyStatus, setNotifyStatus] = useState(null); // ✅ New state for notify feedback
  const [notifying, setNotifying] = useState(false);

  // ✅ Department Options
  const departmentOptions = [
    { label: "Front Office & Vision Paradise", value: "Front Office & Vision Paradise" },
    { label: "Vision Petals", value: "Vision Petals" },
    { label: "Vision Mantra", value: "Vision Mantra" },
    { label: "Barakat Office", value: "Barakat Office" },
    { label: "Whitehouse", value: "Whitehouse" },
    { label: "Mini Tajmahal", value: "Mini Tajmahal" },
    { label: "Vision Udaan", value: "Vision Udaan" },
    { label: "Vision Divine", value: "Vision Divine" },
    { label: "Chronosphere", value: "Chronosphere" },
    { label: "Nacl", value: "Nacl" },
    { label: "All is well Hospital", value: "All is well Hospital" },
    { label: "Vision Vista", value: "Vision Vista" },
    { label: "Josh Club", value: "Josh Club" },
  ];

  // ✅ Camera
  const openCamera = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "user";
        input.onchange = async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => setPhoto(reader.result);
          reader.readAsDataURL(file);
        };
        input.click();
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera access is required to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setPhoto(base64Image);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Unable to open camera.");
    }
  };

  // ✅ Submit Visitor
  const handleSubmit = async () => {
    if (!name || !reason || !photo || !department) {
      Alert.alert("Missing Info", "Please fill in all required fields and take a photo.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post("/add", {
        name,
        reason,
        department,
        description,
        hostEmail,
        photo,
      });
      setLoading(false);

      if (response.data.success) {
        setCardUrl(response.data.cardUrl);
        setVisitorId(response.data.visitorId); // ✅ store visitor ID
        setSuccessModalVisible(true);
        setNotifyStatus(null);
      } else {
        Alert.alert("Error", "Failed to add visitor.");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Error", "Unable to connect to the server.");
    }
  };

  // ✅ Notify Host — calls backend API and shows status
  const handleNotify = async () => {
  if (!visitorId) {
    Alert.alert("Error", "No visitor ID found.");
    return;
  }

  try {
    setLoading(true);
    const response = await apiClient.post("/notify", {
      id: visitorId,
      phoneNumber: "+919944774474", // optional; can be omitted
    });
    setLoading(false);

    if (response.data.success) {
      Alert.alert("Success", "Host notified successfully!");
    } else {
      Alert.alert("Error", "Failed to notify host.");
    }
  } catch (error) {
    console.error("Notify Error:", error);
    setLoading(false);
    Alert.alert("Error", "Failed to send notification.");
  }
};


  const handleViewCard = () => cardUrl && Linking.openURL(cardUrl);

  return (
    <LinearGradient colors={["#f0f4f8", "#d9e2ec"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Visitor Management System</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Reason for Visit"
            value={reason}
            onChangeText={setReason}
          />

          {/* ✅ Department Dropdown */}
          <View style={styles.input}>
            <ModalSelector
              data={departmentOptions.map((d, i) => ({ key: i, label: d.label, value: d.value }))}
              initValue="Select Venue"
              onChange={(option) => setDepartment(option.value)}
              style={{ borderRadius: 10 }}
              selectStyle={{
                borderWidth: 0,
                borderRadius: 10,
                backgroundColor: "#f8f9fa",
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
              selectTextStyle={{
                fontSize: 16,
                color: department ? "#333" : "#777",
              }}
              optionContainerStyle={{
                borderRadius: 10,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 5,
                elevation: 4,
              }}
              optionTextStyle={{
                fontSize: 16,
                color: "#333",
              }}
              cancelText="Cancel"
            >
              <Text style={{ fontSize: 16, color: department ? "#333" : "#777" }}>
                {department ? department : "Select Venue"}
              </Text>
            </ModalSelector>
          </View>

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Host Email (optional)"
            value={hostEmail}
            onChangeText={setHostEmail}
          />

          <TouchableOpacity style={styles.photoButton} onPress={openCamera}>
            <LinearGradient colors={["#3498db", "#2980b9"]} style={styles.gradientButton}>
              <Text style={styles.photoButtonText}>
                {photo ? "📷 Retake Photo" : "📸 Capture Photo"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {photo && (
            <Image source={{ uri: photo }} style={styles.preview} resizeMode="cover" />
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient colors={["#27ae60", "#229954"]} style={styles.gradientButton}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ✅ Success Modal */}
      <Modal transparent visible={successModalVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/845/845646.png" }}
              style={{ width: 70, height: 70, marginBottom: 15 }}
            />
            <Text style={styles.successText}>Visitor Added Successfully!</Text>

            <TouchableOpacity style={styles.viewButton} onPress={handleViewCard}>
              <Text style={styles.viewButtonText}>View ID Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleNotify}
              disabled={notifying}
            >
              {notifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.downloadButtonText}>Notify Host</Text>
              )}
            </TouchableOpacity>

            {/* ✅ Notify Status Message */}
            {notifyStatus && (
              <Text
                style={{
                  color: notifyStatus.startsWith("✅") ? "green" : "red",
                  fontWeight: "600",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {notifyStatus}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Submitting...</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f0f4f8", // Light background for the whole screen
  },
  card: {
    backgroundColor: "#ffffff",
    width: "90%",
    maxWidth: 550,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50", // Darker, more professional color
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e6ed",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 17,
    backgroundColor: "#fdfefe",
    color: "#34495e",
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButton: {
    width: "100%",
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  photoButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 100, // Circular image
    borderWidth: 4,
    borderColor: "#3498db", // A vibrant blue
    marginVertical: 25,
    alignSelf: "center",
  },
  submitButton: {
    width: "100%",
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    padding: 35,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  successText: {
    fontSize: 22,
    color: "#27ae60", // A pleasant green
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  viewButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 10,
    width: "80%",
    marginBottom: 12,
  },
  viewButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: "#f39c12", // A warm orange for notify
    paddingVertical: 12,
    borderRadius: 10,
    width: "80%",
    marginBottom: 15,
  },
  downloadButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    marginTop: 10,
  },
  closeText: {
    color: "#e74c3c", // A strong red for close
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
