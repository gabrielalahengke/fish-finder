/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, Polyline} from 'react-native-maps';


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
      koordinat1: [
        {
          latitude: 1.123889,
          longitude: 125.551389
        }
      ],
      koordinat: [
        {
          latitude: 1.123889,
          longitude: 125.551389
        },
        {
          latitude: 1.423889,
          longitude: 125.801389
        },
        {
          latitude: 1.823889,
          longitude: 125.801389
        },
        {
          latitude: 2.423889,
          longitude: 125.801389
        }
      ], 
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
          koordinat1: [
            ...this.state.koordinat1,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          ],
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
        >
        {this.state.koordinat.map((titik, index) => (
          <Marker key={index} coordinate={titik}/>
        ))}

        <Polyline
          key="editingPolyline"
          coordinates={this.state.koordinat1}
          strokeColor="rgba(51,122,328,0.8)"
          fillColor="rgba(51,122,328,0.5)"
          strokeWidth={5}
        />
        </MapView>
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
