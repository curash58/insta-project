import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';
import { useNavigation } from '@react-navigation/native';
import { createPost } from '../lib/firebase/posts';
import { getCurrentUser } from '../lib/firebase/auth';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PostCreation = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  // Check authentication state when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
        setUserId(user.uid);
      } else {
        console.log('No user is signed in');
        setUserId(null);
        Alert.alert('Authentication Error', 'You must be logged in to create a post');
        navigation.goBack();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating post with userId:', userId);
      
      const result = await createPost(userId, {
        caption: caption.trim()
      }, image);

      if (result.success) {
        Alert.alert('Success', 'Post created successfully!');
        // Reset the form
        setImage(null);
        setCaption('');
        // Navigate back to the Main screen
        navigation.navigate('Main');
      } else {
        console.error('Post creation failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error in handlePost:', error);
      Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={50} color="#A3D1C6" />
                  <Text style={styles.placeholderText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.captionContainer}>
              <Text style={styles.sectionTitle}>Caption</Text>
              <TextInput
                style={styles.captionInput}
                placeholder="Write a caption"
                placeholderTextColor="#A3D1C6"
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.postButton,
                (!image || !caption.trim() || isLoading) && styles.postButtonDisabled
              ]}
              onPress={handlePost}
              disabled={!image || !caption.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FBFFE4" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      <TabForAllPages />
    </View>
  );
};

export default PostCreation;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  header: {
    padding: 15,
    backgroundColor: '#3D8D7A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FBFFE4',
    textAlign: 'center',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#3D8D7A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#A3D1C6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 10,
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionInput: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    padding: 15,
    fontSize: 16,
    color: '#3D8D7A',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  postButton: {
    backgroundColor: '#3D8D7A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3D8D7A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  postButtonDisabled: {
    backgroundColor: '#A3D1C6',
  },
  postButtonText: {
    color: '#FBFFE4',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
