import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TabForAllPages from '../components/tabForAllPages';
import * as ImagePicker from 'expo-image-picker';
import { logoutUser, getCurrentUser, updateUserProfile, updateUserEmail, updateUserPassword, deleteUserAccount, sendVerificationEmail } from '../lib/firebase/auth';
import { getUserById } from '../lib/firebase/users';

const Settings = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('username');
  const [email, setEmail] = useState('user@example.com');
  const [profileImage, setProfileImage] = useState('https://picsum.photos/200/200?random=profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      try {
        const result = await getUserById(currentUser.uid);
        if (result.success) {
          setUsername(result.user.username);
          setEmail(result.user.email);
          if (result.user.photoURL) {
            setProfileImage(result.user.photoURL);
          }
          setIsEmailVerified(currentUser.emailVerified);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

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
        setIsUpdatingPhoto(true);
        try {
          const updateResult = await updateUserProfile({
            photoURL: result.assets[0].uri
          });

          if (updateResult.success) {
            setProfileImage(result.assets[0].uri);
            Alert.alert('Success', 'Profile picture updated successfully!');
          } else {
            Alert.alert('Error', updateResult.error || 'Failed to update profile picture');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to update profile picture');
        } finally {
          setIsUpdatingPhoto(false);
          setIsAvatarModalVisible(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
      setIsUpdatingPhoto(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const result = await updateUserPassword(currentPassword, newPassword);
      
      if (result.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordModalVisible(false);
        Alert.alert('Success', 'Password updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    }
  };

  const updateEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      // First, verify current email if not verified
      const currentUser = getCurrentUser();
      if (currentUser && !currentUser.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Your current email is not verified. We need to verify it before changing to a new one.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Send Verification Email',
              onPress: async () => {
                try {
                  const result = await sendVerificationEmail();
                  if (result.success) {
                    Alert.alert(
                      'Verification Email Sent',
                      'Please check your inbox and verify your email before trying to change it.',
                      [{ text: 'OK', onPress: () => setIsEmailModalVisible(false) }]
                    );
                  } else {
                    Alert.alert('Error', result.error || 'Failed to send verification email');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to send verification email');
                }
              }
            }
          ]
        );
        return;
      }

      // If email is verified, proceed with changing it
      const result = await updateUserEmail(newEmail, currentPassword);
      
      if (result.success) {
        setEmail(newEmail);
        setNewEmail('');
        setCurrentPassword('');
        setIsEmailModalVisible(false);

        // Send verification for new email
        await sendVerificationEmail();
        
        Alert.alert(
          'Email Updated', 
          'Your email has been updated successfully! A verification email has been sent to your new address. Please verify it.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update email');
    }
  };

  const updateUsername = async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    
    try {
      const updateResult = await updateUserProfile({
        username: newUsername
      });
      
      if (updateResult.success) {
        setUsername(newUsername);
        setNewUsername('');
        setIsUsernameModalVisible(false);
        Alert.alert('Success', 'Username updated successfully!');
      } else {
        Alert.alert('Error', updateResult.error || 'Failed to update username');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    try {
      const result = await deleteUserAccount(currentPassword);
      
      if (result.success) {
        setDeleteConfirmation('');
        setIsDeleteAccountModalVisible(false);
        
        // Navigate back to login screen after account deletion
        navigation.navigate('Login');
        Alert.alert('Account Deleted', 'Your account has been successfully deleted');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await logoutUser();
              if (result.success) {
                // Navigation will be handled by the Navigation component
                // which listens to auth state changes
              } else {
                Alert.alert('Error', result.error || 'Failed to logout');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'An unexpected error occurred');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSendVerificationEmail = async () => {
    try {
      const result = await sendVerificationEmail();
      if (result.success) {
        Alert.alert('Success', 'Verification email sent. Please check your inbox.');
      } else {
        Alert.alert('Error', result.error || 'Failed to send verification email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    }
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
            <View style={styles.profileNameContainer}>
              <Text style={styles.profileName}>{username}</Text>
              <TouchableOpacity onPress={() => setIsUsernameModalVisible(true)}>
                <Ionicons name="create-outline" size={20} color="#3D8D7A" />
              </TouchableOpacity>
            </View>
            <View style={styles.emailContainer}>
              <Text style={styles.profileEmail}>{email}</Text>
              {!isEmailVerified && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verificationText}>Not verified</Text>
                  <TouchableOpacity 
                    style={styles.verificationButton}
                    onPress={handleSendVerificationEmail}
                  >
                    <Text style={styles.verificationButtonText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
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

          <View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={20} color="#3D8D7A" style={styles.logoutIcon} />
              {isLoading ? (
                <ActivityIndicator color="#3D8D7A" size="small" />
              ) : (
                <Text style={styles.logoutText}>Log out</Text>
              )}
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
                disabled={isUpdatingPhoto}
              >
                {isUpdatingPhoto ? (
                  <ActivityIndicator color="#FBFFE4" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={20} color="#FBFFE4" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Choose from Gallery</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsAvatarModalVisible(false)}
                disabled={isUpdatingPhoto}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your current password"
                placeholderTextColor="#A3D1C6"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
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
              
              <Text style={styles.inputLabel}>Enter your password</Text>
              <TextInput
                style={[styles.input, styles.dangerInput]}
                placeholder="Enter your current password"
                placeholderTextColor="#FF4D6760"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
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

        {/* Username Change Modal */}
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
                autoCapitalize="none"
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#FFF',
    borderColor: '#3D8D7A',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#3D8D7A',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
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
    padding: 15,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: 'center',
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
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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
    marginRight: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#A3D1C6',
    marginTop: 5,
  },
  emailContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verificationText: {
    fontSize: 12,
    color: '#FF4D67',
    marginRight: 10,
  },
  verificationButton: {
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verificationButtonText: {
    color: '#FBFFE4',
    fontSize: 12,
    fontWeight: 'bold',
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
