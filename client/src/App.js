    import React, { Component } from 'react';
    import logo from './logo.svg';
    import './App.css';
    import axios from 'axios';

    class App extends Component {

        state = {
          description: '',
          selectedFile: '',
          prediction:''
        };


      onChange = (e) => {
        switch (e.target.name) {
          case 'selectedFile':
            this.setState({ selectedFile: e.target.files[0] });
            break;
          default:
            this.setState({ [e.target.name]: e.target.value });
        }
      }


      onSubmit = (e) => {
        e.preventDefault();
        const { description, selectedFile } = this.state;
        let formData = new FormData();

        formData.append('description', description);
        formData.append('selectedFile', selectedFile);

        axios.post('/', formData)
          .then((result) => {

                let z = result.data;
                console.log("RE-post: ", z);

                console.log("POSTED!!!");

                console.log(this.state.selectedFile);

                this.setState({prediction: z.toString()});

                alert("The file is successfully read!");

          });

      }


      render() {

        return (
          <div>

            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h3> This app is using MobileNet model with tfjs-node to predict objects from an image</h3>
              </header>
            </div>

              <p id = "submit">Press choose file to upload an image or make <br/>a pic if on mobile phone. Then press submit.</p>
          
          <form id = "submit" onSubmit={this.onSubmit}>
           {/* <input
              type="text"
              name="description"
              value={description}
              onChange={this.onChange}
            />*/}
            <input 
              type="file"
              name="selectedFile"
              onChange={this.onChange}
            />
            <button id = "submitBtn" type="submit">Submit</button>
          </form>


          <form onSubmit={this.onSubmit1}> </form>

          <div>
              <p id = "submit">
                {this.state.prediction}
              </p>
          </div>

          </div>
        );
      }
    }

export default App;
