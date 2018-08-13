import React, { Component } from 'react';
import axios from 'axios';
import uuidv1 from 'uuid/v1';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Dropzone from 'react-dropzone';

const SAKURA_STAGE = ['Pink bud', 'Start blooming', 'Blooming', 'Falling'];


class App extends Component {
  state = { files: [] }

  onDrop(files) {
    this.setState({
      files: files.map(file => {
        file.id = uuidv1();
        return file;
      }
    )});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.files && this.state.files.length > 0) {
      var formData = new FormData();
      this.state.files.forEach(file => {
        formData.append(file.id, file);
      });
      axios({
        headers: {'Content-Type': 'multipart/form-data' },
        method: 'post',
        url: 'http://127.0.0.1:5000/predict',
        data: formData,
      }).then((res) => {
        if (res && res.data && res.data.results) {
          this.setState({ files: this.state.files.map((file) => {
            file.stage = res.data.results[file.id];
            return file;
          })});
        }
      });
    }
  }

  render() {
    return (
      <div className="App container my-4">
        <h1>Sakura</h1>
        <form onSubmit={this.handleSubmit}>
          <section>
            <div className="dropzone">
              <Dropzone onDrop={this.onDrop.bind(this)}>
                <p>Try dropping some files here, or click to select files to upload.</p>
              </Dropzone>
            </div>
            <h2 className="">Uploaded files</h2>
            <div className="text-left">
              <ul className="file-list">
                {this.state.files && this.state.files.length > 0 ?
                  this.state.files.map(f =>
                    <li key={f.name} className="mb-2 img-thumbnail">
                      <img src={f.preview} height="100px" className="mr-2" />
                      <span className="text-success">{f.stage !== undefined && SAKURA_STAGE[f.stage]}</span>
                      <div className="side-info">{f.name} - {f.size} bytes</div>
                      
                    </li>
                  ) : (
                    <h6 className="text-center">No file uploaded</h6>
                  )
                }
              </ul>
            </div>
          </section>
          <button
            className="btn btn-primary"
            disabled={!this.state.files || this.state.files.length < 1}
          >
            Get Sakura stage
          </button>
        </form>
      </div>
    );
  }
}

export default App;
