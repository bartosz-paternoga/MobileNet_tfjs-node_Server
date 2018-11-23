    import React, { Component } from 'react';
    import axios from 'axios';

    class App extends Component {
      constructor() {
        super();
        this.state = {
          description: '',
          selectedFile: '',
          a:''
        };
      }

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

            // access results...

                           alert("The file is successfully uploaded");
          });

      }



      onSubmit1 = (e) => {
        e.preventDefault();


        axios.post('/1')
          .then((result) => {

                let v = result.data;
                console.log("RE-get: ", v);
      this.setState({a: v.toString()});
                console.log("ANALYSED!!!");
            // access results...

                           alert("analysed");
          });
      }

      render() {
        const { description, selectedFile } = this.state;
        return (
          <div>

          <form onSubmit={this.onSubmit}>
            <input
              type="text"
              name="description"
              value={description}
              onChange={this.onChange}
            />
            <input
              type="file"
              name="selectedFile"
              onChange={this.onChange}
            />
            <button type="submit">Submit</button>
          </form>


          <form onSubmit={this.onSubmit1}>

            <button type="submit">predict</button>
          </form>



      <div className="App">
        <p className="App-intro">
            Classification: 
            {this.state.a}
        </p>
 </div>

           </div>
        );
      }
    }
export default App;
