import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TabForAllPages from '../components/tabForAllPages';
import * as ImagePicker from 'expo-image-picker';
import { logoutUser, getCurrentUser, updateUserProfile, updateUserPassword, deleteUserAccountAndAssociatedData, sendVerificationEmail, requestPasswordReset } from '../lib/firebase/auth';
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
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      console.log('Current user in settings:', currentUser);
      
      if (!currentUser) {
        console.log('No user currently logged in');
        Alert.alert('Error', 'You must be logged in to access settings');
        navigation.navigate('Login');
        return;
      }
      
      try {
        const result = await getUserById(currentUser.uid);
        if (result.success) {
          setUsername(result.user.username);
          setEmail(result.user.email);
          if (result.user.photoURL) {
            setProfileImage(result.user.photoURL);
          }
          setIsEmailVerified(currentUser.emailVerified);
        } else {
          console.error('Failed to get user data:', result.error);
          Alert.alert('Error', 'Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.navigate('ProfileUser');
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm account deletion');
      return;
    }

    setIsLoading(true); // Show loading indicator
    try {
      // Call the new comprehensive delete function
      const result = await deleteUserAccountAndAssociatedData(currentPassword);
      
      if (result.success) {
        setDeleteConfirmation('');
        setIsDeleteAccountModalVisible(false);
        // Navigation back to login screen is usually handled by the Auth listener
        // after the user is deleted.
        Alert.alert('Account Deleted', 'Your account and all associated data have been successfully deleted');
      } else {
        // Handle specific errors like re-authentication needed
        if (result.code === 'auth/requires-recent-login') {
          Alert.alert(
            'Re-authentication Required', 
            'This is a sensitive operation and requires you to log in again. Please log out and log back in before deleting your account.'
          );
        } else if (result.code === 'auth/wrong-password') {
          Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
        } else {
          Alert.alert('Error', result.error || 'Failed to delete account. Please try again.');
        }
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      Alert.alert('Error', 'An unexpected error occurred during account deletion.');
    } finally {
      setIsLoading(false); // Hide loading indicator
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

  const handlePasswordReset = async () => {
    Alert.alert(
      'Reset Password',
      'A password reset email will be sent to your email address. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Reset Email',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await requestPasswordReset(email);
              if (result.success) {
                Alert.alert(
                  'Email Sent',
                  'Password reset instructions have been sent to your email address.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to send password reset email');
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
            <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D8D7A" />
            <Text style={styles.loadingText}>Loading user data...</Text>
          </View>
        ) : (
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
                onPress={handlePasswordReset}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Reset Password</Text>
                  <Text style={styles.settingValue}>Send reset email</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#3D8D7A" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
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
        )}

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
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A3D1C6"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#A3D1C6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
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
                <Text style={styles.modalTitle}>Delete Account</Text>
                <TouchableOpacity onPress={() => setIsDeleteAccountModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#3D8D7A" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalText}>
                This action is irreversible. All your posts, comments, and profile data will be permanently deleted.
              </Text>
              <Text style={styles.modalText}>
                Please enter your current password and type DELETE below to confirm.
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                placeholderTextColor="#A3D1C6"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Type DELETE to confirm"
                placeholderTextColor="#A3D1C6"
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (deleteConfirmation === 'DELETE') {
                    handleDeleteAccount();
                  }
                }}
              />
              <TouchableOpacity 
                style={styles.modalDangerButton}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirm Deletion</Text>
                )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FBFFE4',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
  },
  loadingText: {
    color: '#3D8D7A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FBFFE4',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    backgroundColor: '#3D8D7A',
    borderRadius: 15,
    padding: 8,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginRight: 5,
  },
  emailContainer: {
    alignItems: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verificationText: {
    color: '#FF4D67',
    marginRight: 10,
  },
  verificationButton: {
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  verificationButtonText: {
    color: '#FBFFE4',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#FBFFE4',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFFE4',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D8D7A',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#3D8D7A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerSection: {
    marginBottom: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFFE4',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4D67',
  },
  dangerIcon: {
    marginRight: 8,
  },
  dangerText: {
    color: '#FF4D67',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalText: {
    fontSize: 14,
    color: '#3D8D7A',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    fontSize: 16,
    color: '#3D8D7A',
  },
  modalDangerButton: {
    backgroundColor: '#FF4D67',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FBFFE4',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Settings;
