const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const peer = new Peer(undefined, {
    host: '/',
    port: '5001'
})

const peers = {}

const myVideo = document.createElement('video');
myVideo.muted = true;

console.log('I.m here');

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);

        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

//functions
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })

    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoGrid.append(video);
}

//User Events