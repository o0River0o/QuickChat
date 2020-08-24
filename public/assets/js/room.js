const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const peer = new Peer()

const peers = {}

var participants = 1;
document.getElementById('users').innerText = participants;

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

        participants++;
        document.getElementById('users').innerText = participants;
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();

    participants--;
    document.getElementById('users').innerText = participants;
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

function copyInvite() {
    if (!window.getSelection) {
        alert('Please copy the URL from the location bar.');
        return;
    }
    const dummy = document.createElement('p');
    dummy.textContent = window.location.href;
    document.body.appendChild(dummy);

    const range = document.createRange();
    range.setStartBefore(dummy);
    range.setEndAfter(dummy);

    const selection = window.getSelection();
    // First clear, in case the user already selected some other text
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand('copy');
    document.body.removeChild(dummy);

    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}
