import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';

const PostCreation = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');

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

  const handlePost = () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    Alert.alert('Success', 'Post created successfully!');
    setImage(null);
    setCaption('');
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={pickImage}
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
        </View>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#B3D8A8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  content: {
    flex: 1,
    padding: 20,
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
  captionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B3D8A8',
    padding: 15,
    marginBottom: 20,
  },
  captionInput: {
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
  },
  postButtonDisabled: {
    backgroundColor: '#A3D1C6',
  },
  postButtonText: {
    color: '#FBFFE4',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
