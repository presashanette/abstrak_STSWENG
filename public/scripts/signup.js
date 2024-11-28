function shakeBoxes(usernameError, passwordError) {
    if (usernameError) {
        document.getElementById("username").style.outline = "1px solid red";
        var usernameBox = document.querySelector(".username-box");
        usernameBox.classList.add("shake");
        setTimeout(function() {
            usernameBox.classList.remove("shake");
        }, 500);
    }

    if (passwordError) {
        document.getElementById("password").style.outline = "1px solid red";
        var passwordBox = document.querySelector(".password-box");
        passwordBox.classList.add("shake");
        setTimeout(function() {
            passwordBox.classList.remove("shake");
        }, 500);
    }
}

function togglePasswordVisibility(field) {
    var passwordField = document.getElementById(field);

    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}

function showError(message, usernameError = false, passwordError = false) {
    const errorText = document.getElementById("error-text");
    errorText.textContent = message;
    errorText.style.display = 'block';
    shakeBoxes(usernameError, passwordError);
}

function validatePassword(password) {
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRequirements.test(password);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.show-password').addEventListener('click', function() {
        togglePasswordVisibility('password');
    });

    document.getElementById('signup-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        if (!validatePassword(password)) {
            showError("Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.");
            return;
        }

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, username, password, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectUrl;
            } else {
                let usernameError = false;
                let passwordError = false;
                if (data.message.includes("Username")) {
                    usernameError = true;
                }
                showError(data.message, usernameError, passwordError);
            }
        })
        .catch(error => {
            console.error('Error during signup process:', error);
            showError("Internal Server Error");
        });
    });
});
