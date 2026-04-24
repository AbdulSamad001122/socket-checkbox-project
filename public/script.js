const socket = io();

let username = "";
const tooltip = document.getElementById("tooltip");
const container = document.getElementById("container");

const modalOverlay = document.getElementById("modal-overlay");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");

const resetBtn = document.getElementById("reset-btn");
const adminModalOverlay = document.getElementById("admin-modal-overlay");
const adminPasswordInput = document.getElementById("admin-password-input");
const adminSubmitBtn = document.getElementById("admin-submit-btn");
const adminCancelBtn = document.getElementById("admin-cancel-btn");

const errorModalOverlay = document.getElementById("error-modal-overlay");
const errorCloseBtn = document.getElementById("error-close-btn");

const localStates = {};

joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Username is mandatory to join!");
    return;
  }
  modalOverlay.style.display = "none";
});

resetBtn.addEventListener("click", () => {
  adminPasswordInput.value = "";
  adminModalOverlay.style.display = "flex";
});

adminCancelBtn.addEventListener("click", () => {
  adminModalOverlay.style.display = "none";
});

adminSubmitBtn.addEventListener("click", () => {
  const password = adminPasswordInput.value;
  if (password) {
    socket.emit("admin-reset", password);
    adminModalOverlay.style.display = "none";
  }
});

errorCloseBtn.addEventListener("click", () => {
  errorModalOverlay.style.display = "none";
});

function showTooltip(e, id) {
  const state = localStates[id];
  if (state && state.state && state.username) {
    tooltip.textContent = `Checked by ${state.username}`;
    tooltip.style.opacity = "1";
    tooltip.style.left = e.clientX + 10 + "px";
    tooltip.style.top = e.clientY + 15 + "px";
  } else {
    tooltip.style.opacity = "0";
  }
}

function hideTooltip() {
  tooltip.style.opacity = "0";
}

for (let i = 0; i < 100000; i++) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkbox-" + i;

  checkbox.addEventListener("change", (e) => {
    if (!username) {
      e.preventDefault();
      checkbox.checked = !checkbox.checked; 
      return;
    }
    
    localStates[checkbox.id] = { state: checkbox.checked, username: username };
    
    socket.emit("checkbox-changed", {
      id: checkbox.id,
      state: checkbox.checked,
      username: username
    });
    
    showTooltip(e, checkbox.id);
  });

  checkbox.addEventListener("mouseenter", (e) => showTooltip(e, checkbox.id));
  checkbox.addEventListener("mousemove", (e) => showTooltip(e, checkbox.id));
  checkbox.addEventListener("mouseleave", hideTooltip);

  container.appendChild(checkbox);
}

socket.on("initial-state", (state) => {
  for (const id in state) {
    localStates[id] = state[id];
    const box = document.getElementById(id);
    if (box) {
      box.checked = state[id].state;
    }
  }
});

socket.on("reset", () => {
  for (const id in localStates) {
    delete localStates[id];
  }
  
  const boxes = document.querySelectorAll('input[type="checkbox"]');
  boxes.forEach(box => {
    box.checked = false;
  });
  
  hideTooltip();
});

socket.on("reset-failed", () => {
  errorModalOverlay.style.display = "flex";
});

socket.on("update", (data) => {
  localStates[data.id] = { state: data.state, username: data.username };

  const box = document.getElementById(data.id);
  if (box) {
    box.checked = data.state;
  }
  
  if (tooltip.style.opacity === "1" && tooltip.textContent.includes("Checked by")) {
  
  }
});
