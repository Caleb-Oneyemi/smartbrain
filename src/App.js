import React, { Component } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Register from './components/Register/Register';
import Signin from './components/Signin/Signin';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';


const app = new Clarifai.App({
 apiKey: '5edb78d199d24b6eb7781b395e840d80'
});

const ParticlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }  
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
        input:'',
        imageUrl: '',
        box: {},
        route: 'signin',
        isSignedIn: false
    }
  }

  faceLocationCalculator = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  } 

  faceBoxDisplay = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => this.faceBoxDisplay(this.faceLocationCalculator(response)))
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
      this.setState({route: route});
  }

  render() {
    const  { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={ParticlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'
          ? <div> 
              <Logo />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
              route === 'signin'
                 ? <Signin onRouteChange={this.onRouteChange}/>
                 : <Register onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
