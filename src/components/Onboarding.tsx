import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

export interface Slide {
  title: string;
  description: string;
  color: string;
}

interface OnboardingProps {
  slides: Slide[];
  onComplete?: () => void;
}

const OnboardingSwiper = ( { slides, onComplete } : OnboardingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('onboarding');
        if (value === null) {
          setIsFirstTime(true);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  })

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
      });
    }
  };

  const Slide = ( item  : Slide) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const Dots = () => (
    <View style={styles.pagination}>
      {slides.map((slide, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.activeDot : null,
          ]}
        />
      ))}
    </View>
  );

  const onViewableItemsChanged = useCallback(({ viewableItems } : any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const handleGetStarted = async (onComplete: () => void ) => {
    try {
      await AsyncStorage.setItem('onboarding', 'true');
      setIsFirstTime(false);
      onComplete();
    } catch (error) {
      console.log(error);
    }
  }

  const defaultOnComplete = () => {
    console.log('Onboarding completed');
  }



  if (!isFirstTime) {
    return null;
  }
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide {...item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      
      <View style={styles.footer}>
        <Dots />
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.getStartedButton]} 
            onPress={() => handleGetStarted(onComplete ?? defaultOnComplete)}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  getStartedButton: {
    backgroundColor: 'white',
  },
  getStartedText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingSwiper;