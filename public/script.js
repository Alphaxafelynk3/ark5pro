document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    async function login() {
        console.log("Login function called");
        let email = document.getElementById("loginEmail").value;
        let password = document.getElementById("loginPassword").value;

        console.log("Email:", email);
        console.log("Password:", password);

        let response = await fetch("/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        let data = await response.json();
        console.log("Response data:", data); // Log the response data
        document.getElementById("statusMessage").innerText = data.message;

        if (response.ok) {
            window.location.href = "dashboard.html"; // Redirect to dashboard after successful login
        }
    }

    // Attach login function to the form submission
    const adminLoginForm = document.getElementById("adminLoginForm");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent default form submission
            console.log("Form submitted"); // Log form submission
            login(); // Call the login function
        });
    } else {
        console.error("Admin login form not found"); // Log error if form is not found
    }

    // Handle file upload
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent the default form submission

            const formData = new FormData(uploadForm);
            let response = await fetch("/admin/upload", {
                method: "POST",
                body: formData,
            });

            let data = await response.json();
            document.getElementById("uploadStatus").innerText = data.message;
        });
    }

    // Fetch user information
    async function fetchUserInfo() {
        let response = await fetch("/admin/users");
        let users = await response.json();
        const userInfoDiv = document.getElementById("userInfo");
        if (userInfoDiv) {
            userInfoDiv.innerHTML = ""; // Clear previous content

            users.forEach(user => {
                const userDiv = document.createElement("div");
                userDiv.innerText = `Email: ${user.email}, Wallet: ${user.wallet}`;
                userInfoDiv.appendChild(userDiv);
            });
        }
    }

    // Fetch uploaded content
    async function fetchUploadedContent() {
        let response = await fetch("/admin/uploads");
        let files = await response.json();
        const uploadedContentDiv = document.getElementById("uploadedContent");
        if (uploadedContentDiv) {
            uploadedContentDiv.innerHTML = ""; // Clear previous content

            files.forEach(file => {
                const fileDiv = document.createElement("div");
                fileDiv.innerText = file;
                uploadedContentDiv.appendChild(fileDiv);
            });
        }
    }

    // Call the functions to fetch user info and uploaded content on page load
    fetchUserInfo();
    fetchUploadedContent();
});
