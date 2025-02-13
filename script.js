async function signup() {
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    let data = await response.json();
    document.getElementById("statusMessage").innerText = data.message;
}

async function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    let data = await response.json();
    document.getElementById("statusMessage").innerText = data.message;

    if (response.ok) {
        window.location.href = "dashboard.html";
    }
}

function showSignup() {
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
}

function showLogin() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

async function uploadContent(event) {
    event.preventDefault(); // Prevent the default form submission

    const title = document.getElementById('content-title').value;
    const files = document.getElementById('media-files').files;
    const price = document.getElementById('content-price').value;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    for (let i = 0; i < files.length; i++) {
        formData.append('media-files', files[i]);
    }

    try {
        const response = await fetch('/admin/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${yourAdminToken}` // Include your admin token here
            }
        });

        const data = await response.json();
        document.getElementById('uploadStatus').innerText = response.ok ? 'Upload successful!' : data.message;
    } catch (error) {
        document.getElementById('uploadStatus').innerText = 'Error uploading content.';
        console.error('Error:', error);
    }
}

function redirectToPayment() {
    const price = document.getElementById('content-price').value;
    window.location.href = `payment.html?amount=${price}`;
}
