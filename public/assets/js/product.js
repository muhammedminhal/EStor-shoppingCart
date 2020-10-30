const chatInitiator = () => {
    var loggedUserEmail = document.getElementById('emial').value;
    var socket = io("/", {
        query: {
            email_address: loggedUserEmail
        }
    });
    localStorage.setItem("roomInitiatorEmail", loggedUserEmail);
    document.location.href = "/users/chat";

    var email = document.getElementById('emial').value;
    var semail = document.getElementById('semial').value;
    console.log("useremail:",email,"seller email:",semail)
    var body = {
        uEmail: email,
        sEmail: semail
    }

  

}


const InitiatorJoin = () => {
    const roomInitiatorEmail = localStorage.getItem("roomInitiatorEmail");
    var socket = io("/", {
        query: {
            target: roomInitiatorEmail
        }
    });
    const textarea = document.getElementById('textarea');
    
    const senderEmail = document.getElementById("uEmail").value;


    textarea.addEventListener('keyup', (e) => {
		if (e.key === 'Enter') {
            let messageObject = {
                message: e.target.value,
                target: roomInitiatorEmail,
                origin: senderEmail
            }
            console.log
            socket.emit("message", messageObject);
            
            //appendMessage() //outgoing
		}
    })
    socket.on("message", (body) => {
        console.log(body.message)
        //appendMessage() //incoming
        const messageObject = {
            message: body.message,
            origin: body.origin
        }
        appendMessage(messageObject,"incoming")
        textarea.value = ""
        messageScroll()
    })
}

const sellerJoinHandler = (data) => {
 
    const InitiatorEmail = data.getAttribute("data-mail");
    localStorage.setItem("roomInitiatorEmail", InitiatorEmail);
    document.getElementById('card').style.display='none'
    
    const id = data.getAttribute("data-id")

    axios.post("http://localhost:3000/users/notificationDelete",{id}).then(()=>{
    })
    document.location.href = "/users/chat"; 
    
}

const messageHandler = (socket) => {
    socket.on("message", (message) => {
        console.log(message)
    })
}