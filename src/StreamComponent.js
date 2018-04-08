import React, { Component } from 'react';
import './StreamComponent.css';

export default class StreamComponent extends Component {

  constructor(props){
    super(props);

    console.log(props);

    this.state = {
      videoSrc: '',
      videoSrcUnsafe: '',
    }

    this.handleVideoClicked = this.handleVideoClicked.bind(this);

    var that = this;

    var intervalSrc = setInterval(function(){
      if(that.state!==undefined){
        if(props.stream!==undefined){
          if(props.stream.mediaStream!==undefined){
            if(props.stream.mediaStream!==null){
              console.log(props.stream.mediaStream);
              var src = URL.createObjectURL(props.stream.mediaStream);
              if (!(that.state.videoSrcUnsafe === src)) {
                that.setState({
                  videoSrc: src,
                  videoSrcUnsafe: src
                });
                clearInterval(intervalSrc);
              }
            }
          }
        }
      }
    }, 200);
  }
  
  componentWillReceiveProps(nextProps){
    var that = this;
    if(that.state!==undefined){
      if(nextProps.stream!==undefined){
        if(nextProps.stream.mediaStream!==undefined){
          if(nextProps.stream.mediaStream!==null){
            var src = URL.createObjectURL(nextProps.stream.mediaStream);
            if (!(that.state.videoSrcUnsafe === src)) {
              that.setState({
                videoSrc: src,
                videoSrcUnsafe: src
              });
            }
          }
        }
      }
    }
  }

  getNicknameTag() {
    return JSON.parse(this.props.stream.connection.data).clientData;
  }
  
  videoClicked(event) {
    if(this.props.mainVideoStream){
      this.props.mainVideoStream(this.props.stream);
    }
  }

  handleVideoClicked(event){
    this.videoClicked(event);
  }

  render() {
    console.log(this.state.src);
    return (
      <div className="streamcomponent">
        <video src={this.state.videoSrc} id={'native-video-' + this.props.stream.connection.connectionId + '_webcam'} onClick={this.handleVideoClicked} autoPlay={true} muted={this.props.isMuted}></video>
        <div id={'data-' + this.props.stream.connection.connectionId}><p>{this.getNicknameTag()}</p></div>
      </div>
    )
  }
}
