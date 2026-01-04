//Email real time validation
const emailInput = document.getElementById("email");
const errorMsg = document.getElementById("email-error");

const contactEmailRegex =
  /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

emailInput.addEventListener("input", () => {
  const value = emailInput.value;

  if (value === "") {
    emailInput.classList.remove("error");
    errorMsg.textContent = "";
    return;
  }

  const isValid = contactEmailRegex.test(value);

  if (!isValid) {
    errorMsg.textContent = "Invalid email format";
  } else {
    errorMsg.textContent = "";
  }
});

//Contact Form
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const message = document.getElementById("form-message");

    const contactTextarea = document.getElementById("message").value.trim();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const topic = document.getElementById("topic").value.trim();

    if (!contactTextarea || !name || !email || !topic) {
      message.textContent = "Please fill in all required fields!";
      message.className = "form-message error";
      return;
    }

    message.textContent = "Your message has been submitted successfully!";
    message.className = "form-message success";

    this.reset();
  });
