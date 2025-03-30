import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';
import { useNavigation } from '@react-navigation/native';

const PostCreation = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const navigation = useNavigation();

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

  const generateAIImage = () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for the AI image generation');
      return;
    }

    setIsGeneratingImage(true);
    // random photo for now
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 1000);
      setImage(`https://picsum.photos/500/500?random=${randomId}`);
      setIsGeneratingImage(false);
      Alert.alert('Success', 'Image generated successfully!');
    }, 1500);
  };

  const handlePost = () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    
    // Create a new post object
    const newPost = {
      id: Math.random().toString(),
      username: 'current_user',
      userProfileImage: 'https://randomuser.me/api/portraits/men/88.jpg',
      imageUrl: image,
      likesCount: 0,
      commentsCount: 0,
      caption: caption,
      createdAt: new Date().toISOString()
    };
    
    // Navigate to the PostPage with the new post
    navigation.navigate('PostPage', { post: newPost });
    
    // Reset the form
    setImage(null);
    setCaption('');
    setAiPrompt('');
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

            <View style={styles.aiGenerationSection}>
              <Text style={styles.sectionTitle}>Generate AI Image</Text>
              <View style={styles.aiInputContainer}>
                <TextInput
                  style={styles.aiPromptInput}
                  placeholder="Enter a prompt for AI image generation..."
                  placeholderTextColor="#A3D1C6"
                  value={aiPrompt}
                  onChangeText={setAiPrompt}
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity 
                  style={[
                    styles.generateButton,
                    (!aiPrompt.trim() || isGeneratingImage) && styles.disabledButton
                  ]}
                  onPress={generateAIImage}
                  disabled={!aiPrompt.trim() || isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <Text style={styles.buttonText}>Generating...</Text>
                  ) : (
                    <>
                      <Ionicons name="color-wand-outline" size={20} color="#FBFFE4" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Generate</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

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
                (!image || !caption.trim()) && styles.postButtonDisabled
              ]}
              onPress={handlePost}
              disabled={!image || !caption.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
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
  aiGenerationSection: {
    marginBottom: 20,
  },
  aiInputContainer: {
    flexDirection: 'column',
  },
  aiPromptInput: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    padding: 15,
    fontSize: 16,
    color: '#3D8D7A',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 10,
  },
  generateButton: {
    backgroundColor: '#3D8D7A',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A3D1C6',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FBFFE4',
    fontSize: 16,
    fontWeight: 'bold',
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
