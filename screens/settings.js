import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TabForAllPages from '../components/tabForAllPages';
import * as ImagePicker from 'expo-image-picker';

const Settings = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('username');
  const [email, setEmail] = useState('user@example.com');
  const [profileImage, setProfileImage] = useState('https://picsum.photos/200/200?random=profile');
  
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permission to change your avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        setIsAvatarModalVisible(false);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const updateUsername = () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    // Here you would call your API to update the username
    setUsername(newUsername);
    setNewUsername('');
    setIsUsernameModalVisible(false);
    Alert.alert('Success', 'Username updated successfully!');
  };

  const updatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalVisible(false);
    Alert.alert('Success', 'Password updated successfully!');
  };

  const updateEmail = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setEmail(newEmail);
    setNewEmail('');
    setIsEmailModalVisible(false);
    Alert.alert('Success', 'Email updated successfully!');
  };

  const deleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    // Here you would call your API to delete the account
    setDeleteConfirmation('');
    setIsDeleteAccountModalVisible(false);
    
    // Navigate back to login screen after account deletion
    navigation.navigate('Login');
    Alert.alert('Account Deleted', 'Your account has been successfully deleted');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FBFFE4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => setIsAvatarModalVisible(true)}>
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
              />
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="#FBFFE4" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setIsUsernameModalVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Username</Text>
                <Text style={styles.settingValue}>{username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3D8D7A" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setIsPasswordModalVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Password</Text>
                <Text style={styles.settingValue}>••••••••</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3D8D7A" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setIsEmailModalVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3D8D7A" />
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.dangerSection]}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => setIsDeleteAccountModalVisible(true)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4D67" style={styles.dangerIcon} />
              <Text style={styles.dangerText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Avatar Change Modal */}
        <Modal
          visible={isAvatarModalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Profile Picture</Text>
                <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.avatarPreviewContainer}>
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.avatarPreview} 
                />
              </View>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={20} color="#FBFFE4" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsAvatarModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Username Modal */}
        <Modal
          visible={isUsernameModalVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Username</Text>
                <TouchableOpacity onPress={() => setIsUsernameModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>New Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new username"
                placeholderTextColor="#A3D1C6"
                value={newUsername}
                onChangeText={setNewUsername}
              />
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={updateUsername}
              >
                <Text style={styles.buttonText}>Update Username</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={isPasswordModalVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#A3D1C6"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A3D1C6"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#A3D1C6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={updatePassword}
              >
                <Text style={styles.buttonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Email Modal */}
        <Modal
          visible={isEmailModalVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Email</Text>
                <TouchableOpacity onPress={() => setIsEmailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>New Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new email address"
                placeholderTextColor="#A3D1C6"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={updateEmail}
              >
                <Text style={styles.buttonText}>Update Email</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          visible={isDeleteAccountModalVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, styles.dangerText]}>Delete Account</Text>
                <TouchableOpacity onPress={() => setIsDeleteAccountModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.deleteWarning}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
              
              <Text style={styles.inputLabel}>Type DELETE to confirm</Text>
              <TextInput
                style={[styles.input, styles.dangerInput]}
                placeholder="DELETE"
                placeholderTextColor="#FF4D6760"
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
              />
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]}
                onPress={deleteAccount}
              >
                <Text style={styles.dangerButtonText}>Delete My Account</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
      
      <TabForAllPages />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3D8D7A',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FBFFE4',
    textAlign: 'center',
  },
  placeholder: {
    width: 34, 
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#3D8D7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#3D8D7A',
    fontWeight: '600',
    marginBottom: 3,
  },
  settingValue: {
    fontSize: 14,
    color: '#A3D1C6',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#FF4D6730',
    backgroundColor: '#FFF5F5',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
  },
  dangerIcon: {
    marginRight: 8,
  },
  dangerText: {
    color: '#FF4D67',
    fontWeight: '600',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    width: '85%',
    backgroundColor: '#FBFFE4',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D8D7A',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    fontSize: 16,
    color: '#3D8D7A',
  },
  actionButton: {
    backgroundColor: '#3D8D7A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FBFFE4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteWarning: {
    fontSize: 14,
    color: '#FF4D67',
    marginBottom: 15,
    textAlign: 'center',
  },
  dangerInput: {
    borderColor: '#FF4D6730',
  },
  dangerButtonText: {
    color: '#FF4D67',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#3D8D7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3D8D7A',
  },
  editOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3D8D7A',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBFFE4',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginTop: 15,
  },
  profileEmail: {
    fontSize: 16,
    color: '#A3D1C6',
    marginTop: 5,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#3D8D7A',
  },
  buttonIcon: {
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: '#FBFFE4',
    borderWidth: 1,
    borderColor: '#3D8D7A',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#3D8D7A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Settings;
