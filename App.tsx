/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView from 'react-native-maps';


class DefaultMarkers extends React.Component {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      region: {
        latitude : 1.409178,
        longitude : 125.138794,
        latitudeDelta : 10,
        longitudeDelta : 10
      } ,
      koordinat: [], 
      arah: null
    };
  }

  async componentDidMount() {
    await Geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 3,
            longitudeDelta: 3,
          },
          arah: [],
        });
      }
    );
  }

  onRegionChange(region: region) {
    this.setState({ region });
  }

  render() {
  console.log(this.state);
    return (
      <View style={styles.container}>
        <MapView style={styles.map}
        showsUserLocation
        initialRegion={this.state.region}
        />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default DefaultMarkers;
