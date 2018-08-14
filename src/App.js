import React, { Component } from 'react';
import toastr from 'toastr';
import axios from 'axios';
import uuidv1 from 'uuid/v1';
import Dropzone from 'react-dropzone';

// Import styles for toastr
import 'toastr/build/toastr.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import LoadingIndicator from './LoadingIndicator';

const SAKURA_STAGE = ['Beginning', 'Pink bud', 'Start blooming', 'Blooming', 'Falling', 'Leaves'];


class App extends Component {
  state = { files: [], loading: false }

  onDrop = (files, rejectedFiles) => {
    this.setState({
      files: [
        ...this.state.files,
        ...files.map(file => {
          file.id = uuidv1();
          return file;
        }),
      ],
    });
    if (rejectedFiles && rejectedFiles.length > 0) toastr.error('Unsupported file type');
  }

  removeFile = (fileId) => {
    this.setState({
      files: this.state.files.filter(f => f.id !== fileId),
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.files && this.state.files.length > 0 && this.state.files.filter(f => !f.stage).length > 0) {
      var formData = new FormData();
      this.state.files.filter(f => !f.stage).forEach(file => {
        formData.append(file.id, file);
      });
      this.setState({ loading: true});
      axios({
        headers: {'Content-Type': 'multipart/form-data' },
        method: 'post',
        url: 'http://127.0.0.1:5000/predict',
        data: formData,
      }).then((res) => {
        if (res && res.data && res.data.results) {
          this.setState({ files: this.state.files.map((file) => {
            if (res.data.results[file.id] !== undefined) {
              file.stage = res.data.results[file.id];
            }
            return file;
          })});
        }
        this.setState({ loading: false });
      }).catch(() => {
        toastr.error('Something went wrong. Please try again later');
        this.setState({ loading: false });
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
              <Dropzone
                onDrop={this.onDrop.bind(this)}
                accept={['image/jpeg', 'image/png']}
              >
                <p>Try dropping some files here, or click to select files to upload.</p>
              </Dropzone>
            </div>
            <h2 className="">Uploaded files</h2>
            <div className="text-left">
              <ul className="file-list">
                {this.state.files && this.state.files.length > 0 ?
                  this.state.files.map(f =>
                    <li key={f.id} className="mb-2 img-thumbnail">
                      <img src={f.preview} height="100px" className="mr-4" />
                      <span className="text-success">{(this.state.loading && f.stage === undefined) ? <LoadingIndicator color="gray" /> : (f.stage !== undefined && SAKURA_STAGE[f.stage])}</span>
                      <div className="side-info">
                        {f.name} - {f.size} bytes
                        {!this.state.loading && <span className="delete-icon-btn" onClick={() => this.removeFile(f.id)}>X</span>}
                      </div>
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
            {this.state.loading ? <LoadingIndicator /> : 'Get Sakura stage'}
          </button>
        </form>
      </div>
    );
  }
}

export default App;
