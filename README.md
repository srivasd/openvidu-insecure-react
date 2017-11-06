# openvidu-insecure-react
<a href="https://github.com/srivasd/openvidu-insecure-react" target="_blank"><i class="icon ion-social-github"> Check it on GitHub</i></a>

A client-side only application built with React framwork.

If it is the first time you use OpenVidu, it is higly recommended to start with **[openvidu-hello-world](/tutorials/openvidu-hello-world/)** tutorial, as this app is no more than an extension of it with some new features and sytles.

This is the React version of [openvidu-insecure-js](/tutorials/openvidu-insecure-js/). Try it if you plan to use React framework for your frontend.

## Understanding this tutorial

<p align="center">
  <img class="img-responsive" src="./public/resources/images/openvidu-insecure-react.png">
</p>

OpenVidu is composed by the three modules displayed on the image above in its insecure version.

- **openvidu-browser**: NPM package for your React app. It allows you to manage your video-calls straight away from your clients
- **openvidu-server**: Java application that controls Kurento Media Server
- **Kurento Media Server**: server that handles low level operations of media flow transmissions

<div style="
    display: table;
    border: 1px solid #0088aa;
    border-radius: 5px;
    width: 100%;
    margin-top: 30px;
    margin-bottom: 25px;"><div style="display: table-cell">
    <i class="icon ion-android-alert" style="
    font-size: 50px;
    color: #0088aa;
    display: inline-block;
    padding-left: 25%;
"></i></div>
<div style="
    vertical-align: middle;
    display: table-cell;
    padding-left: 20px;
    padding-right: 20px;
    ">
	Tutorial's name includes "insecure" word because this application has no backend and therefore it has no control over the users. Typically you don't want such application in production environments. When you feel comfortable with the client-side of OpenVidu, add your own server or follow one of our super simple secure tutorials.
</div>
</div>

## Running this tutorial

1) Clone the repo and checkout to version v1.1.0:

```bash
git clone https://github.com/srivasd/openvidu-insecure-react.git
cd openvidu-insecure-react
```

2) You will need openvidu-browser for the React frontend. You can install it and other npm necessary packages with the following commands:

```bash
npm install 
npm i openvidu-browser
```

3) Run the tutorial:

```bash
npm start
```

4) _openvidu-server_ and _Kurento Media Server_ must be up and running in your development machine. The easiest way is running this Docker container which wraps both of them (you will need [Docker CE](https://store.docker.com/search?type=edition&offering=community)):

```bash
docker run -p 8443:8443 --rm -e KMS_STUN_IP=stun.l.google.com -e KMS_STUN_PORT=19302 -e openvidu.secret=MY_SECRET openvidu/openvidu-server-kms
```

5) Go to [`localhost:3000`](http://localhost:3000) to test the app once the server is running. The first time you use the docker container, an alert message will suggest you accept the self-signed certificate of _openvidu-server_ when you first try to join a video-call.

<br>

> To learn **some tips** to develop with OpenVidu, check this **[FAQ](/troubleshooting#2-any-tips-to-make-easier-the-development-of-my-app-with-openvidu)**

> If you are using **Windows**, read this **[FAQ](/troubleshooting/#3-i-am-using-windows-to-run-the-tutorials-develop-my-app-anything-i-should-know)** to properly run the tutorial

<div class="row no-margin row-gallery">
	<div class="col-md-6">
		<a data-fancybox="gallery" href="./public/resources/images/insecure-join.png">
		<img class="img-responsive" src="./public/resources/images/insecure-join.png">
	</a>
	</div>
	<div class="col-md-6">
		<a data-fancybox="gallery" href="./public/resources/images/insecure-session.png">
		<img class="img-responsive" src="./public/resources/images/insecure-session.png">
	</a>
	</div>
</div>

## Understanding the code

This is an Angular project generated with angular-cli, and therefore you will see lots of configuration files and other stuff that doesn't really matter to us. We will focus on the following files under `src/app/` folder:

- `App.js`: AppComponent, main component of the app. It contains the functionalities for joining a video-call and for handling the video-calls themselves.
- `App.css`: CSS for AppComponent.
- `StreamComponent.js`: StreamComponent, auxiliary component to manage Stream objects on our own. It wraps the final HTML `<video>` which will display the video of its Stream property, as well as the user's nickname in a `<p>` element.
- `StreamComponent.css`: CSS for StreamComponent.

Let's see how `App.js` uses NPM package `openvidu-browser`:

---

#### First line imports the necessary objects from `openvidu-browser`:

```typescript
import { OpenVidu } from 'openvidu-browser';
```

---

####`App.js` declares the following properties in the state:

```typescript
//These properties are in the state's component in order to re-render the HTML when the values of them change
this.state = {
    valueSessionId: 'SessionA',
    valueUserName: 'Participant' + Math.floor(Math.random() * 100),
    session: undefined,
    mainVideoStream: undefined,
    localStream: undefined,
    remoteStreams: [],
};

```
`OpenVidu` object will allow us to get a `Session` object. `remoteStreams` array will store the active streams of other users in the video-call and `localStream` will be your own local webcam stream. Finally, `ValueSessionId` and `valueUserName` params simply represent the video-call and your participant's nickname, as you will see in a moment.

---

#### Whenever a user clicks on the submit input defined in `App.js` template, `joinSession()` method is called:

```typescript
// --- 1) Get an OpenVidu object and init a session with a sessionId ---

// Init OpenVidu object
this.OV = new OpenVidu();

// We will join the video-call "sessionId". As there's no server, this parameter must start with the URL of
// OpenVidu Server (with secure websocket protocol: "wss://") and must include the OpenVidu secret at the end
this.setState({
        session: this.OV.initSession("wss://" + window.location.hostname + ":8443/" + this.sessionId.value + '?secret=MY_SECRET'),
      }
```
Session's identifiers must begin with the URL where _openvidu-server_ listens, so they can connect through WebSocket to it. It is necessary to explicitly set this URL in the param when using a pure frontend web. Since we are in a local sample app, `OV.initSession` will finally receive `wss://localhost:8443/` as its _openvidu-server_ URL. `sessionId` is the distinctive portion of the session identifier and allows OpenVidu to differentiate sessions from each other. In this case, this parameter is retrieved from HTML input `<input class="form-control" type="text" id="sessionId" ... >`, which may be filled by the user. Finally, `'?secret=MY_SECRET'` string allows us to connect to OpenVidu directly from the browser, without a server side.

<div style="
    display: table;
    border: 1px solid #0088aa;
    border-radius: 5px;
    width: 100%;
    margin-top: 30px;
    margin-bottom: 25px;"><div style="display: table-cell">
    <i class="icon ion-android-alert" style="
    font-size: 50px;
    color: #0088aa;
    display: inline-block;
    padding-left: 25%;
"></i></div>
<div style="
    vertical-align: middle;
    display: table-cell;
    padding-left: 20px;
    padding-right: 20px;
    ">
	<strong>WARNING</strong>: this is only for demos and developing environments. Do NOT include your secret in production. Check this <a href="/docs/troubleshooting#5-what-are-the-differences-related-to-openvidu-between-an-app-without-a-server-side-and-an-app-with-a-server-side">FAQ</a> to learn more.
</div>
</div>

```typescript
// --- 2) Specify the actions when events take place ---

// On every new Stream received...
mySession.on('streamCreated', (event) => {
          //We use an auxiliar array to push the new stream
          var myRemoteStreams = that1.state.remoteStreams; 

          myRemoteStreams.push(event.stream); 
          //We updated the state in order to re-render the DOM
          var pushRS = setInterval(that1.setState({
            remoteStreams: myRemoteStreams
          }, () => {
            if(myRemoteStreams===that1.state.remoteStreams){
              clearInterval(pushRS);
          }}), 200);
          // Subscribe to the Stream to receive it. Second parameter is an empty string 
          // so OpenVidu doesn't create an HTML video by its own 
          mySession.subscribe(event.stream, '');

        });

// On every Stream destroyed...
mySession.on('streamDestroyed', (event) => {

	// Avoid OpenVidu trying to remove the HTML video element
	event.preventDefault();
	
	// Remove the stream from 'remoteStreams' array
	this.deleteRemoteStream(event.stream);
});
```
Here we subscribe to the Session events that interest us. As we are using React framework, a good approach will be treating each Stream as a component, contained in a StreamComponent. Thus, we need to store each new stream we received in an array (`remoteStreams`), and we must remove from it every deleted stream whenever it is necessary. To achieve this, we use the following events:

- `streamCreated`: for each new Stream received by OpenVidu, we store it in our `remoteStreams` array and immediately subscribe to it so we can receive its video (empty string as second parameter, so OpenVidu doesn't create an HTML video on its own). HTML template of AppComponent will show the new video, as it contains a `.map` js function (in order to manage the DOM) which will create a new StreamComponent for each Stream object stored in the array:

```html
{ this.state.remoteStreams.map((s, i) => <div key={i} className="stream-container col-md-6 col-xs-6">
              <StreamComponent stream={s} isMuted={false} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
            </div>) }
```
	
- `streamDestroyed`: for each Stream that has been destroyed (which means a user has left the video-call), we remove it from `remoteStreams` array, so React will automatically delete the required StreamComponent from HTML. We call `event.preventDefault()` to cancel OpenVidu default behaviour towards `streamDestroyed` event, which is the deletion of the previously created HTML video element on `streamCreated` event. Because we are handling the video elements by ourselves taking advantage of Angular capabilities, we tell OpenVidu not to create them on `streamCreated` and not to delete them on `streamDestroyed`, by passing an empty string as second parameter on `Session.subscribe()` method on `streamCreated` and by calling `event.preventDefault()` on `streamDestroyed`.

---

#### Finally connect to the session and publish your webcam:

```typescript

// --- 3) Connect to the session ---

// First param irrelevant if your app has no server-side. Second param will be received by every user
// in Stream.connection.data property, which will be appended to DOM as the user's nickname
var that = this;
mySession.connect(null, '{"clientData": "' + this.state.valueUserName + '"}', (error) => {
	
	// If connection successful, initialize a publisher and publish to the session
	if (!error) {

		// --- 4) Get your own camera stream with the desired resolution ---

        // Both audio and video will be active. Second parameter is an empty string
        // so OpenVidu doesn't create an HTML video by its own
		let publisher = thst.OV.initPublisher('', {
			audio: true,
			video: true,
			quality: 'MEDIUM'
		});

        var streamInterval = setInterval(function(){
              that.setState({
                // Store your webcam stream in 'localStream' object
                localStream: publisher.stream,
                // Set the main video in the page to display our webcam
                mainVideoStream: that.state.localStream
              }, () => {
                if(that.state.localStream!==undefined&&that.state.mainVideoStream!==undefined){
                  clearInterval(streamInterval);
              }})}, 200);

		// --- 5) Publish your stream ---

		mySession.publish(publisher);

	} else {
		console.log('There was an error connecting to the session:', error.code, error.message);
	}
});
```
	
In `mySession.connect` method: first param is irrelevant when you don't have a backend (it is the user's token). Remember `videoElementCreated` event, when we added the user's nickname to the HTML? Well, second parameter is the actual value you will receive in `Stream.connection.data` property. So in this case it is a JSON formatted string with a "clientData" tag with "token" value, which is retrieved from HTML input `<input type="text" id="participantId" required>` (filled by the user and also reused for the first `token` param).

In the callback of `Session.connect` method, we check the connection has been succesful (`error` value must be _null_) and right after that we get a `Publisher` object with both audio and video activated and MEDIUM quality. We then store our local Stream (contained in `Publisher.stream` object) in `localStream`, make our main video display our stream and publish the Publisher object through `Session.publish()` method. The rest of users will receive our Stream object and will execute their `streamCreated` event.

With regard to our local Stream, AppComponent's HTML template has also one StreamComponent declaration ready to show our own webcam as we did with remote streams:

```html
{ this.state.localStream !== undefined ? <div className="stream-container col-md-6 col-xs-6">
              <StreamComponent stream={this.state.localStream} isMuted={true} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
            </div> : null }
```
Last point worth considering is the implementation of StreamComponent. As we are handling Stream objects by ourselves (task which usually is taken care by OpenVidu), and because the URL of Stream objects takes some time to get its final value as the WebRTC negotiation takes place, we must listen to any change in `stream` props property. We do so getting the `HTMLVideoElement` from our view on `constructor()` method, and then listening to `componentWillReceiveProps()`. This allows us to update `videoElement.srcObject` value, which is the ultimate property that indicates our`<video>` element where to receive the media stream. If we didn't do this, the Stream object will update its _srcObject_ property, but our StreamComponent would keep the same initial `videoElement.srcObject` value. This ensures that all our StreamComponent's will properly display all the videos in the video-call using the correct _srcOjbect_ value.

`getNickNameTag()` method feeds the view of StreamComponent with the nickName of the user. Remember `session.connect` method and its second param? It can be now found at `stream.connection.data`, so every user will receive the nickName of others.

`videoClicked()` tells our AppComponent parent that the user has clicked on certain video, and that the main view should update the main video stream.

```typescript
componentWillReceiveProps(nextProps){ // Detect any change in 'stream' property (specifically in its 'srcObject' property)
    var that = this;

    var intervalSrcProps = setInterval(function(){
      if(that.state!==undefined){
        if(nextProps.stream.videoSrcObject!==undefined){
          var src = URL.createObjectURL(nextProps.stream.videoSrcObject);
          if (!(that.state.videoSrcUnsafe === src)) {
            that.setState({
              videoSrc: src,
              videoSrcUnsafe: src
            });
            clearInterval(intervalSrcProps);
          }
        }
      }
    }, 200);
  }

getNicknameTag() { // Gets the nickName of the user
    return JSON.parse(this.props.stream.connection.data).clientData;
  }

videoClicked(event) { // Triggers event for the parent component to update its view
    if(this.props.mainVideoStream){
      this.props.mainVideoStream(this.props.stream);
    }
}
```

---

#### Leaving the session:

Whenever we want a user to leave the session, we just need to call `session.disconnect` method:

```typescript
leaveSession() {

	// --- 6) Leave the session by calling 'disconnect' method over the Session object ---
	var mySession = this.state.session;
    if(this.OV) {mySession.disconnect();}

	...
}
```

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.1.20/jquery.fancybox.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.1.20/jquery.fancybox.min.js"></script>
<script>
  $().fancybox({
    selector : '[data-fancybox="gallery"]',
    infobar : true,
    arrows : false,
    loop: true,
    protect: true,
    transitionEffect: 'slide',
    buttons : [
        'close'
    ],
    clickOutside : 'close',
    clickSlide   : 'close',
  });
</script>