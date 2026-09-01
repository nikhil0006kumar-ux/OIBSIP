"use strict";

const USERS_KEY = "secureAccessUsers";
const SESSION_KEY = "secureAccessSession";

function getUsers() {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
    try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        return storedSession ? JSON.parse(storedSession) : null;
    } catch {
        return null;
    }
}

function saveSession(username) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            username: username,
            authenticated: true
        })
    );
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function normalize(value) {
    return value.trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasNumber(password) {
    return /\d/.test(password);
}

function getPasswordStrength(password) {
    if (!password) {
        return {
            text: "None",
            width: 0,
            level: "none"
        };
    }

    let score = 0;

    if (password.length >= 8) {
        score++;
    }

    if (/\d/.test(password)) {
        score++;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }

    if (password.length >= 12) {
        score++;
    }

    if (score <= 2) {
        return {
            text: "Weak",
            width: 35,
            level: "weak"
        };
    }

    if (score <= 3) {
        return {
            text: "Medium",
            width: 68,
            level: "medium"
        };
    }

    return {
        text: "Strong",
        width: 100,
        level: "strong"
    };
}

function setFieldError(input, errorElement, message) {
    const wrapper = input.closest(".input-wrapper");

    if (message) {
        errorElement.textContent = message;
        wrapper.classList.add("input-error");
        wrapper.classList.remove("input-success");
        input.setAttribute("aria-invalid", "true");
    } else {
        errorElement.textContent = "";
        wrapper.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
    }
}

function setFieldSuccess(input) {
    const wrapper = input.closest(".input-wrapper");
    wrapper.classList.remove("input-error");
    wrapper.classList.add("input-success");
    input.removeAttribute("aria-invalid");
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type} show`;
}

function hideMessage(element) {
    element.textContent = "";
    element.className = "message";
}

function setLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.classList.add("loading");
    } else {
        button.disabled = false;
        button.classList.remove("loading");
    }
}

function shakeElement(element) {
    element.classList.remove("shake");
    void element.offsetWidth;
    element.classList.add("shake");
}

function updatePasswordUI(password) {
    const lengthRule = document.getElementById("lengthRule");
    const numberRule = document.getElementById("numberRule");
    const strengthText = document.getElementById("strengthText");
    const strengthProgress = document.getElementById("strengthProgress");

    if (!lengthRule || !numberRule || !strengthText || !strengthProgress) {
        return;
    }

    const validLength = password.length >= 8;
    const validNumber = hasNumber(password);
    const strength = getPasswordStrength(password);

    lengthRule.classList.toggle("valid", validLength);
    numberRule.classList.toggle("valid", validNumber);

    strengthText.textContent = strength.text;
    strengthProgress.style.width = `${strength.width}%`;

    if (strength.level === "weak") {
        strengthProgress.style.background = "#fb7185";
        strengthText.style.color = "#fb7185";
    } else if (strength.level === "medium") {
        strengthProgress.style.background = "#fbbf24";
        strengthText.style.color = "#fbbf24";
    } else if (strength.level === "strong") {
        strengthProgress.style.background = "#4ade80";
        strengthText.style.color = "#4ade80";
    } else {
        strengthProgress.style.background = "#fb7185";
        strengthText.style.color = "#657184";
    }
}

function setupPasswordToggles() {
    const toggles = document.querySelectorAll(".password-toggle");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) {
                return;
            }

            const shouldShow = input.type === "password";
            input.type = shouldShow ? "text" : "password";
            toggle.textContent = shouldShow ? "Hide" : "Show";
            toggle.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );
        });
    });
}

function setupRegistration() {
    const form = document.getElementById("registerForm");

    if (!form) {
        return;
    }

    const usernameInput = document.getElementById("registerUsername");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("confirmPassword");

    const usernameError = document.getElementById("registerUsernameError");
    const emailError = document.getElementById("registerEmailError");
    const passwordError = document.getElementById("registerPasswordError");
    const confirmError = document.getElementById("confirmPasswordError");

    const message = document.getElementById("registerMessage");
    const button = document.getElementById("registerButton");

    passwordInput.addEventListener("input", () => {
        updatePasswordUI(passwordInput.value);

        if (passwordInput.value.length >= 8 && hasNumber(passwordInput.value)) {
            setFieldSuccess(passwordInput);
            passwordError.textContent = "";
        }
    });

    confirmInput.addEventListener("input", () => {
        if (!confirmInput.value) {
            setFieldError(
                confirmInput,
                confirmError,
                ""
            );
            return;
        }

        if (confirmInput.value === passwordInput.value) {
            setFieldSuccess(confirmInput);
            confirmError.textContent = "";
        } else {
            setFieldError(
                confirmInput,
                confirmError,
                "Passwords do not match."
            );
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        hideMessage(message);

        const username = usernameInput.value.trim();
        const email = normalize(emailInput.value);
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        let valid = true;

        if (!username) {
            setFieldError(
                usernameInput,
                usernameError,
                "Username is required."
            );
            valid = false;
        } else if (username.length < 3) {
            setFieldError(
                usernameInput,
                usernameError,
                "Username must contain at least 3 characters."
            );
            valid = false;
        } else {
            setFieldSuccess(usernameInput);
            usernameError.textContent = "";
        }

        if (!email) {
            setFieldError(
                emailInput,
                emailError,
                "Email address is required."
            );
            valid = false;
        } else if (!isValidEmail(email)) {
            setFieldError(
                emailInput,
                emailError,
                "Enter a valid email address."
            );
            valid = false;
        } else {
            setFieldSuccess(emailInput);
            emailError.textContent = "";
        }

        if (!password) {
            setFieldError(
                passwordInput,
                passwordError,
                "Password is required."
            );
            valid = false;
        } else if (password.length < 8) {
            setFieldError(
                passwordInput,
                passwordError,
                "Password must contain at least 8 characters."
            );
            valid = false;
        } else if (!hasNumber(password)) {
            setFieldError(
                passwordInput,
                passwordError,
                "Password must contain at least 1 number."
            );
            valid = false;
        } else {
            setFieldSuccess(passwordInput);
            passwordError.textContent = "";
        }

        if (!confirmPassword) {
            setFieldError(
                confirmInput,
                confirmError,
                "Please confirm your password."
            );
            valid = false;
        } else if (password !== confirmPassword) {
            setFieldError(
                confirmInput,
                confirmError,
                "Passwords do not match."
            );
            valid = false;
        } else {
            setFieldSuccess(confirmInput);
            confirmError.textContent = "";
        }

        if (!valid) {
            shakeElement(form);
            return;
        }

        const users = getUsers();

        const usernameExists = users.some(
            user => normalize(user.username) === normalize(username)
        );

        const emailExists = users.some(
            user => normalize(user.email) === email
        );

        if (usernameExists || emailExists) {
            showMessage(
                message,
                "An account with these details already exists.",
                "error"
            );
            shakeElement(form);
            return;
        }

        const newUser = {
            username: username,
            email: email,
            password: password
        };

        users.push(newUser);
        saveUsers(users);

        setLoading(button, true);

        showMessage(
            message,
            "Account created successfully. You can now sign in.",
            "success"
        );

        form.reset();
        updatePasswordUI("");

        setTimeout(() => {
            window.location.href = "login.html?registered=true";
        }, 1300);
    });
}

function setupLogin() {
    const form = document.getElementById("loginForm");

    if (!form) {
        return;
    }

    const identifierInput = document.getElementById("loginIdentifier");
    const passwordInput = document.getElementById("loginPassword");
    const identifierError = document.getElementById("loginIdentifierError");
    const passwordError = document.getElementById("loginPasswordError");
    const message = document.getElementById("loginMessage");
    const button = document.getElementById("loginButton");

    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "true") {
        showMessage(
            message,
            "Account created successfully. You can now sign in.",
            "success"
        );

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        hideMessage(message);

        const identifier = normalize(identifierInput.value);
        const password = passwordInput.value;

        let valid = true;

        if (!identifier) {
            setFieldError(
                identifierInput,
                identifierError,
                "Username or email is required."
            );
            valid = false;
        } else {
            identifierError.textContent = "";
        }

        if (!password) {
            setFieldError(
                passwordInput,
                passwordError,
                "Password is required."
            );
            valid = false;
        } else {
            passwordError.textContent = "";
        }

        if (!valid) {
            shakeElement(form);
            return;
        }

        const users = getUsers();

        const user = users.find(currentUser => {
            const matchesIdentifier =
                normalize(currentUser.username) === identifier ||
                normalize(currentUser.email) === identifier;

            return matchesIdentifier && currentUser.password === password;
        });

        if (!user) {
            showMessage(
                message,
                "Invalid username/email or password.",
                "error"
            );

            identifierInput.closest(".input-wrapper").classList.add("input-error");
            passwordInput.closest(".input-wrapper").classList.add("input-error");

            shakeElement(form);
            return;
        }

        setLoading(button, true);
        saveSession(user.username);

        showMessage(
            message,
            "Login successful. Redirecting to your dashboard...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);
    });
}

function protectDashboard() {
    const session = getSession();

    if (!session || session.authenticated !== true || !session.username) {
        window.location.replace("login.html");
        return;
    }

    const users = getUsers();

    const user = users.find(
        currentUser =>
            normalize(currentUser.username) === normalize(session.username)
    );

    if (!user) {
        clearSession();
        window.location.replace("login.html");
        return;
    }

    const usernameElement = document.getElementById("dashboardUsername");
    const profileUsername = document.getElementById("profileUsername");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatar");

    if (usernameElement) {
        usernameElement.textContent = user.username;
    }

    if (profileUsername) {
        profileUsername.textContent = user.username;
    }

    if (profileEmail) {
        profileEmail.textContent = user.email;
    }

    if (profileAvatar) {
        profileAvatar.textContent = user.username.charAt(0).toUpperCase();
    }
}

function setupLogout() {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {
        clearSession();
        window.location.replace("login.html");
    });
}

function handleAuthenticatedPages() {
    const page = document.body.dataset.page;

    if (page === "dashboard") {
        protectDashboard();
        return;
    }

    if (page === "login" || page === "register") {
        const session = getSession();

        if (
            session &&
            session.authenticated === true &&
            session.username
        ) {
            window.location.replace("dashboard.html");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    handleAuthenticatedPages();
    setupPasswordToggles();
    setupRegistration();
    setupLogin();
    setupLogout();

    const registerPassword = document.getElementById("registerPassword");

    if (registerPassword) {
        updatePasswordUI(registerPassword.value);
    }
});