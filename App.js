import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import logo from './assets/logo.png';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import uploadToAnonymousFilesAsync from 'anonymous-files';

const Button = ({text, onPress, buttonStyle = {}, textStyle = {}}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, buttonStyle]}
  >
    <Text style={[styles.buttonText, textStyle]}>{text}</Text>
  </TouchableOpacity>
)

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);

  const removeSelectedImage = () => setSelectedImage(null);
  const openImagePickerAsync = async () => {
    const permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (pickerResult.cancelled) {
      return;
    }

    if (Platform.OS === 'web') {
      const remoteUri = await uploadToAnonymousFilesAsync(pickerResult.uri);
      setSelectedImage({localUri: pickerResult.uri, remoteUri})
    } else {
      setSelectedImage({localUri: pickerResult.uri, remoteUri: null});
    }
  };

  const openShareDialogAsync = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert(`The image is available for sharing at: ${selectedImage.remoteUri}`);
      return;
    }

    Sharing.shareAsync(selectedImage.localUri);
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.instructions}>To share a photo from your phone with a friend, just click the button bellow!</Text>
      {(!!selectedImage) && 
        <View style={styles.preview}>
          <Image
            source={{uri: selectedImage.localUri}}
            style={styles.thumbnail}
          />
          <Button buttonStyle={styles.fab} textStyle={{fontSize: 15}} onPress={removeSelectedImage} text={'Remove'} />
        </View>
      }
      <View style={styles.buttonsContainer}>
        <Button onPress={openImagePickerAsync} text={'Pick a photo'} />
        <Button onPress={openShareDialogAsync} text={'Share photo'} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {color: '#888', fontSize: 18, marginHorizontal: 15},
  logo:  {width: 305, height: 159, marginBottom: 15},
  button: {backgroundColor: 'blue', padding: 10, borderRadius: 5},
  buttonText: {fontSize: 20, color: '#fff'},
  preview: {
    width: 300,
    height: 300,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray'

  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute'
  },
  buttonsContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  fab: {
    backgroundColor: 'red',
    position: 'absolute',
    bottom: 5,
    right: 5
  }
});
