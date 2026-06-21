const emptyState = document.querySelector("#emptyState");
const notificationStatus = document.querySelector("#notificationStatus");
const reminderForm = document.querySelector("#reminderForm");
const reminderCount = document.querySelector("#reminderCount");
const reminderDate = document.querySelector("#reminderDate");
const reminderList = document.querySelector("#reminderList");
const reminderName = document.querySelector("#reminderName");
const reminderTime = document.querySelector("#reminderTime");

const reminders = [];

function setNotificationStatus(message, type = "") {
  notificationStatus.textContent = message;
  notificationStatus.className = `notification-status ${
    type ? `is-${type}` : ""
  }`;
}

function formatReminderDate(date, time) {
  const reminderDateTime = new Date(`${date}T${time}`);

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(reminderDateTime);
}

function scheduleNotification(reminder) {
  if (!("Notification" in window)) {
    setNotificationStatus(
      "Browser notifications are not supported here.",
      "error"
    );
    return;
  }

  const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
  const delay = reminderDateTime.getTime() - Date.now();

  if (delay <= 0) {
    setNotificationStatus("Choose a future date and time.", "error");
    return;
  }

  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("Reminderly", {
        body: reminder.title,
      });
    }
  }, delay);

  setNotificationStatus(
    `Notification scheduled for ${formatReminderDate(
      reminder.date,
      reminder.time
    )}.`,
    "success"
  );
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    setNotificationStatus(
      "Browser notifications are not supported here.",
      "error"
    );
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    setNotificationStatus(
      "Notifications are blocked. Enable them in your browser settings to receive reminders.",
      "error"
    );
    return false;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    setNotificationStatus(
      "Notifications were not enabled, but your reminder was still added.",
      "error"
    );
    return false;
  }

  return true;
}

function renderReminders() {
  reminderList.innerHTML = "";
  emptyState.hidden = reminders.length > 0;
  reminderCount.textContent = `${reminders.length} ${
    reminders.length === 1 ? "reminder" : "reminders"
  }`;

  reminders.forEach((reminder) => {
    const item = document.createElement("li");
    item.className = "reminder-item";
    item.innerHTML = `
      <div>
        <strong>${reminder.title}</strong>
        <span>${formatReminderDate(reminder.date, reminder.time)}</span>
      </div>
    `;
    reminderList.appendChild(item);
  });
}

reminderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reminder = {
    title: reminderName.value.trim(),
    date: reminderDate.value,
    time: reminderTime.value,
  };

  reminders.push(reminder);

  const canNotify = await requestNotificationPermission();
  if (canNotify) {
    scheduleNotification(reminder);
  }

  reminderForm.reset();
  reminderName.focus();
  renderReminders();
});

renderReminders();
