import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Modal, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../lib/firebase/auth';
import { updateUserData } from '../lib/firebase/users';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../config/firebase';

const SignIn = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempUserCredentials, setTempUserCredentials] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store the user credentials temporarily
      const userCredentials = {
        email,
        password,
        username
      };
      
      // Show the profile modal to collect bio and profile picture
      setShowProfileModal(true);
      
      // Store the credentials for later use
      setTempUserCredentials(userCredentials);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (uri, userId = null) => {
    try {
      // Convert image URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a reference to the storage location
      const user = userId ? { uid: userId } : auth.currentUser;
      
      if (!user || !user.uid) {
        throw new Error('User not authenticated. Please try again.');
      }
      
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      
      // Upload the image
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    }
  };

  const handleProfileSetup = async () => {
    if (!profileImage) {
      Alert.alert('Error', 'Please add a profile picture');
      return;
    }
    
    if (!bio.trim()) {
      Alert.alert('Error', 'Please write a bio');
      return;
    }
    
    if (bio.trim().length < 10) {
      Alert.alert('Error', 'Your bio should be at least 10 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Register the user with the stored credentials first
      const result = await registerUser(
        tempUserCredentials.email, 
        tempUserCredentials.password, 
        tempUserCredentials.username
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create account');
      }
      
      // Now that the user is registered, we can upload the image
      const imageURL = await uploadProfileImage(profileImage, result.user.uid);
      
      // Update the user profile with additional information
      await updateUserData(result.user.uid, {
        bio: bio.trim(),
        photoURL: imageURL,
      });
      
      setShowProfileModal(false);
      setTempUserCredentials(null);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}></Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join our community today!</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#3D8D7A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#A3D1C6"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#3D8D7A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A3D1C6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#3D8D7A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#A3D1C6"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#3D8D7A" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#3D8D7A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#A3D1C6"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#3D8D7A" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FBFFE4" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginText}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  Alert.alert(
                    'Cancel Profile Setup',
                    'Are you sure you want to cancel? You will need to start the sign-up process again.',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Yes, Go Back',
                        onPress: () => {
                          setShowProfileModal(false);
                          setTempUserCredentials(null);
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Complete Your Profile</Text>
              <View style={styles.placeholderView} />
            </View>
            
            <TouchableOpacity 
              style={styles.imagePickerContainer}
              onPress={pickImage}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>Bio</Text>
              <TextInput
                style={styles.bioInput}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#A3D1C6"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleProfileSetup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FBFFE4" size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Complete Setup</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  keyboardView: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#3D8D7A',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 25,
    shadowColor: '#3D8D7A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A3D1C6',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#B3D8A8',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#3D8D7A',
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#3D8D7A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3D8D7A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FBFFE4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#B3D8A8',
  },
  dividerText: {
    color: '#A3D1C6',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#FBFFE4',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D8D7A',
    height: 55,
    justifyContent: 'center',
  },
  loginText: {
    color: '#3D8D7A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#B3D8A8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  placeholderView: {
    width: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8D7A',
    textAlign: 'center',
    flex: 1,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#B3D8A8',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FBFFE4',
    borderWidth: 2,
    borderColor: '#B3D8A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#A3D1C6',
    fontSize: 16,
  },
  bioContainer: {
    marginBottom: 20,
    width: '100%',
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 8,
  },
  bioInput: {
    backgroundColor: '#FBFFE4',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    height: 120,
    fontSize: 16,
    color: '#3D8D7A',
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#3D8D7A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3D8D7A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 55,
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FBFFE4',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
