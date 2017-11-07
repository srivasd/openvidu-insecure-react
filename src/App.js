import React, { Component } from 'react';
import './App.css';
import { OpenVidu } from 'openvidu-browser';
import StreamComponent from './StreamComponent.js';

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {valueSessionId: 'SessionA',
                  valueUserName: 'Participant' + Math.floor(Math.random() * 100),
                  session: undefined,
                  mainVideoStream: undefined,
                  localStream: undefined,
                  remoteStreams: [],
                 };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick  = this.handleClick.bind(this);
    this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
    this.onbeforeunload = this.onbeforeunload.bind(this);
  }

  handleSubmit(event){
    event.preventDefault();
    this.joinSession();
  }

  handleClick(){
    this.leaveSession();
  }

  handleChangeSessionId(e){
    this.setState({
      valueSessionId : e.target.value,
    });
  }

  handleChangeUserName(e){
    this.setState({
      valueUserName : e.target.value,
    });
  }

  joinSession() {

      this.OV = new OpenVidu();

      this.setState({
        session: this.OV.initSession("wss://" + window.location.hostname + ":8443/" + this.sessionId.value + '?secret=MY_SECRET'),
      }, () => {

        var mySession = this.state.session;
        
        var that1 = this;

        
        mySession.on('streamCreated', (event) => {
          
          var myRemoteStreams = that1.state.remoteStreams; 

          myRemoteStreams.push(event.stream); 
          
          that1.setState({
            remoteStreams: myRemoteStreams
          });

          mySession.subscribe(event.stream, '');

        });


        mySession.on('streamDestroyed', (event) => {
          event.preventDefault();
        
          that1.deleteRemoteStream(event.stream);
        });
        
        var that = this;
        
        mySession.connect(null, '{"clientData": "' + this.state.valueUserName + '"}', (error) => {
            
          if (!error) {
            let publisher = that.OV.initPublisher('', {
              audio: true,
              video: true,
              quality: 'MEDIUM'
            });

            var streamInterval = setInterval(function(){
              that.setState({
                localStream: publisher.stream,
                mainVideoStream: that.state.localStream
              }, () => {
                if(that.state.localStream!==undefined&&that.state.mainVideoStream!==undefined){
                  clearInterval(streamInterval);
              }})}, 200);

              mySession.publish(publisher);
          
          } else {
            console.log('There was an error connecting to the session:', error.code, error.message);
          }
                
        });
        return false;
      });    
    }
    
    leaveSession() {
      var mySession = this.state.session;
      
      if(this.OV) {mySession.disconnect();}

      this.OV = null;

      this.setState({
        session: undefined,
        remoteStreams: [],
        valueSessionId: 'SessionA',
        valueUserName: 'Participant' + Math.floor(Math.random() * 100),
        localStream: undefined,
      });

    }

    deleteRemoteStream(stream) {
      var myRemoteStreams = this.state.remoteStreams;
      let index = myRemoteStreams.indexOf(stream, 0);
      if (index > -1) {
        myRemoteStreams.splice(index, 1);
        this.setState({
          remoteStreams: myRemoteStreams
        });
      }
    }

    getMainVideoStream(stream) {
      this.setState({
        mainVideoStream: stream,
      });
    }
    
    onbeforeunload(event) {
      this.leaveSession();
    };

    componentDidMount(){
      window.addEventListener("beforeunload", this.onbeforeunload);
    }

    componentWillUnmount(){
      window.removeEventListener("beforeunload", this.onbeforeunload)
    }

    handleMainVideoStream(stream) {
      this.getMainVideoStream(stream);
    }

  render() {
    var valueSessionId = this.state.valueSessionId;
    var valueUserName = this.state.valueUserName;
      return (
        <div id="main-container" className="container">
        { this.state.session === undefined ? <div id="join">
          <div id="img-div"><img src="resources/images/openvidu_grey_bg_transp_cropped.png" alt="OpenVidu logo"/></div>
          <div id="join-dialog" className="jumbotron vertical-center">
          <h1> Join a video session </h1>
          <form className="form-group" onSubmit={this.handleSubmit}>
            <p>
              <label>Participant: </label>
              <input className="form-control" type="text" id="userName" value={valueUserName} onChange={this.handleChangeUserName.bind(this)}required/>
            </p>
            <p>
              <label> Session: </label>
              <input className="form-control" type="text" id="sessionId" ref={(input) => { this.sessionId = input; }} value={valueSessionId} onChange={this.handleChangeSessionId.bind(this)}required/>
            </p>
            <p className="text-center">
              <input className="btn btn-lg btn-success" name="commit" type="submit" value="JOIN"/>
            </p>
          </form>
          </div>
        </div> : null }
  
        { this.state.session !== undefined ? <div id="session">
          <div id="session-header">
            <h1 id="session-title" value={valueSessionId}>{valueSessionId}</h1>
            <input id="buttonLeaveSession" className="btn btn-large btn-danger" type="button" onClick={this.handleClick} value="LeaveSession"/>
          </div>
          { this.state.mainVideoStream !== undefined ? <div id="main-video" className="col-md-6">
            <StreamComponent stream={this.state.mainVideoStream} isMuted={true}></StreamComponent>
          </div> : null }
          <div id="video-container" className="col-md-6">
          { this.state.localStream !== undefined ? <div className="stream-container col-md-6 col-xs-6">
              <StreamComponent stream={this.state.localStream} isMuted={true} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
            </div> : null }
          { this.state.remoteStreams.map((s, i) => <div key={i} className="stream-container col-md-6 col-xs-6">
              <StreamComponent stream={s} isMuted={false} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
            </div>) }
          </div>
        </div> : null }
      </div>
      ); 
  }
}

export default App;
