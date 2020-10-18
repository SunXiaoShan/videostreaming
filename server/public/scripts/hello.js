const existingCalls = [];

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

const testDiv = document.getElementById('content-test');

const ttt = document.createElement("p");
ttt.setAttribute("class", "username");
ttt.innerHTML = `hello world!!! 999`;
document.getElementById("content-test").innerHTML = "New text!";
testDiv.appendChild(ttt)




ttt.innerHTML = `Ready to conneck socket`;

const socket = io.connect("localhost:5000");
ttt.innerHTML = `connected`;

socket.on("show_hello_world", ({ socketId }) => {
    const text = document.createElement("p");
    text.setAttribute("class", "helloworld");
    
    text.innerHTML = JSON.stringify(socketId);

    testDiv.appendChild(text)

    ttt.innerHTML = `gigigaga`;
});

// Refresh the user list when comming a new connection
socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
});

// Remove the disconnected user
socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
  
    if (elToRemove) {
      elToRemove.remove();
    }
  });

function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");
  
    socketIds.forEach(socketId => {
      const alreadyExistingUser = document.getElementById(socketId);
      if (!alreadyExistingUser) {
        const userContainerEl = createUserItemContainer(socketId);
  
        activeUserContainer.appendChild(userContainerEl);
      }
    });
}

function createUserItemContainer(socketId) {
    const userContainerEl = document.createElement("div");
  
    const usernameEl = document.createElement("p");
  
    userContainerEl.setAttribute("class", "active-user");
    userContainerEl.setAttribute("id", socketId);
    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `Socket: ${socketId}`;
  
    userContainerEl.appendChild(usernameEl);
  
    userContainerEl.addEventListener("click", () => {
      unselectUsersFromList();
      userContainerEl.setAttribute("class", "active-user active-user--selected");
      const talkingWithInfo = document.getElementById("talking-with-info");
      ttt.innerHTML = `Talking with: "Socket: ${socketId}"`;
      callUser(socketId);
    });
  
    return userContainerEl;
  }

  function unselectUsersFromList() {
    const alreadySelectedUser = document.querySelectorAll(
      ".active-user.active-user--selected"
    );
  
    alreadySelectedUser.forEach(el => {
      el.setAttribute("class", "active-user");
    });
  }

  // call the user you selected
  async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  
    socket.emit(
      "call-user", 
      {
        offer,
        to: socketId
      });
  }

  var getCalled = false;
  socket.on("call-made", async data => {
    if (getCalled) {
      const confirmed = confirm(
        `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
      );
  
      if (!confirmed) {
        socket.emit("reject-call", {
          from: data.socket
        });
  
        return;
      }
    }
  
    return
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  
    socket.emit("make-answer", {
      answer,
      to: data.socket
    });
    getCalled = true;
  });

