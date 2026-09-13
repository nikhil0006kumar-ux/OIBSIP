"use strict";

const STORAGE_KEY = "taskflow_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const inputError = document.getElementById("inputError");

const pendingTasksContainer =
    document.getElementById("pendingTasks");

const completedTasksContainer =
    document.getElementById("completedTasks");

const pendingEmpty =
    document.getElementById("pendingEmpty");

const completedEmpty =
    document.getElementById("completedEmpty");

const pendingCount =
    document.getElementById("pendingCount");

const completedCount =
    document.getElementById("completedCount");

const totalTasks =
    document.getElementById("totalTasks");

let tasks = loadTasks();

document.addEventListener("DOMContentLoaded", () => {
    renderTasks();

    taskInput.focus();
});

function loadTasks() {
    try {
        const storedTasks =
            localStorage.getItem(STORAGE_KEY);

        if (!storedTasks) {
            return [];
        }

        const parsedTasks =
            JSON.parse(storedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(isValidTask);

    } catch (error) {
        console.warn(
            "Unable to load saved tasks. Starting with an empty list.",
            error
        );

        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error(
            "Unable to save tasks to localStorage.",
            error
        );
    }
}

function isValidTask(task) {
    return (
        task &&
        typeof task === "object" &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean" &&
        typeof task.createdAt === "string"
    );
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    addTask();
});

function addTask() {
    const text =
        taskInput.value.trim();

    clearInputError();

    if (!text) {
        showInputError(
            "Please enter a task before adding it."
        );

        taskInput.focus();

        return;
    }

    if (text.length > 500) {
        showInputError(
            "Task is too long. Please keep it under 500 characters."
        );

        taskInput.focus();

        return;
    }

    const newTask = {
        id: createTaskId(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
}

function createTaskId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2)
    );
}

function renderTasks() {

    pendingTasksContainer.innerHTML = "";
    completedTasksContainer.innerHTML = "";

    const pendingTasks =
        tasks.filter(task => !task.completed);

    const completedTasks =
        tasks.filter(task => task.completed);

    pendingTasks.forEach(task => {
        pendingTasksContainer.appendChild(
            createTaskElement(task)
        );
    });

    completedTasks.forEach(task => {
        completedTasksContainer.appendChild(
            createTaskElement(task)
        );
    });

    updateCounters(
        pendingTasks.length,
        completedTasks.length
    );

    updateEmptyStates(
        pendingTasks.length,
        completedTasks.length
    );
}

function createTaskElement(task) {

    const article =
        document.createElement("article");

    article.className =
        "task-card task-enter";

    if (task.completed) {
        article.classList.add("completed");
    }

    article.dataset.taskId =
        task.id;

    const statusButton =
        document.createElement("button");

    statusButton.type = "button";

    statusButton.className =
        "task-status-button";

    statusButton.dataset.action =
        "toggle";

    statusButton.setAttribute(
        "aria-label",
        task.completed
            ? "Move task back to pending"
            : "Mark task as complete"
    );

    statusButton.textContent =
        task.completed ? "✓" : "○";

    const content =
        document.createElement("div");

    content.className =
        "task-content";

    const titleRow =
        document.createElement("div");

    titleRow.className =
        "task-title-row";

    const title =
        document.createElement("p");

    title.className =
        "task-title";

    title.textContent =
        task.text;

    titleRow.appendChild(title);

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";

    const created =
        document.createElement("span");

    created.textContent =
        `Added: ${formatDate(task.createdAt)}`;

    meta.appendChild(created);

    if (
        task.completed &&
        task.completedAt
    ) {

        const completed =
            document.createElement("span");

        completed.textContent =
            `Completed: ${formatDate(task.completedAt)}`;

        meta.appendChild(completed);
    }

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";

    const editButton =
        createActionButton(
            "Edit",
            "edit"
        );

    actions.appendChild(editButton);

    const toggleButton =
        createActionButton(
            task.completed
                ? "Move to Pending"
                : "Complete",
            "toggle"
        );

    toggleButton.classList.add(
        task.completed
            ? "reopen-action"
            : "complete-action"
    );

    actions.appendChild(toggleButton);

    const deleteButton =
        createActionButton(
            "Delete",
            "delete"
        );

    deleteButton.classList.add(
        "delete-action"
    );

    actions.appendChild(deleteButton);

    content.appendChild(titleRow);
    content.appendChild(meta);
    content.appendChild(actions);

    article.appendChild(statusButton);
    article.appendChild(content);

    return article;
}

function createActionButton(
    label,
    action
) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "task-action";

    button.dataset.action =
        action;

    button.textContent =
        label;

    return button;
}

pendingTasksContainer.addEventListener(
    "click",
    handleTaskAction
);

completedTasksContainer.addEventListener(
    "click",
    handleTaskAction
);

function handleTaskAction(event) {

    const actionButton =
        event.target.closest(
            "[data-action]"
        );

    if (!actionButton) {
        return;
    }

    const taskCard =
        actionButton.closest(
            ".task-card"
        );

    if (!taskCard) {
        return;
    }

    const taskId =
        taskCard.dataset.taskId;

    const action =
        actionButton.dataset.action;

    if (action === "toggle") {
        toggleTask(taskId);
        return;
    }

    if (action === "edit") {
        editTask(taskId);
        return;
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
}

function toggleTask(taskId) {

    const task =
        tasks.find(
            item => item.id === taskId
        );

    if (!task) {
        return;
    }

    task.completed =
        !task.completed;

    task.completedAt =
        task.completed
            ? new Date().toISOString()
            : null;

    saveTasks();

    renderTasks();
}

function editTask(taskId) {

    const task =
        tasks.find(
            item => item.id === taskId
        );

    if (!task) {
        return;
    }

    const taskCard =
        document.querySelector(
            `.task-card[data-task-id="${CSS.escape(taskId)}"]`
        );

    if (!taskCard) {
        return;
    }

    const content =
        taskCard.querySelector(
            ".task-content"
        );

    if (!content) {
        return;
    }

    const editWrapper =
        document.createElement("div");

    editWrapper.className =
        "edit-wrapper";

    const input =
        document.createElement("textarea");

    input.className =
        "edit-input";

    input.value =
        task.text;

    input.maxLength =
        500;

    input.rows =
        2;

    input.setAttribute(
        "aria-label",
        "Edit task"
    );

    const editActions =
        document.createElement("div");

    editActions.className =
        "edit-actions";

    const saveButton =
        document.createElement("button");

    saveButton.type =
        "button";

    saveButton.className =
        "save-edit";

    saveButton.textContent =
        "Save";

    const cancelButton =
        document.createElement("button");

    cancelButton.type =
        "button";

    cancelButton.className =
        "cancel-edit";

    cancelButton.textContent =
        "Cancel";

    editActions.appendChild(
        saveButton
    );

    editActions.appendChild(
        cancelButton
    );

    editWrapper.appendChild(
        input
    );

    editWrapper.appendChild(
        editActions
    );

    content.innerHTML = "";

    content.appendChild(
        editWrapper
    );

    input.focus();

    input.select();

    saveButton.addEventListener(
        "click",
        () =>
            saveEditedTask(
                taskId,
                input
            )
    );

    cancelButton.addEventListener(
        "click",
        () => renderTasks()
    );

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                saveEditedTask(
                    taskId,
                    input
                );
            }

            if (
                event.key === "Escape"
            ) {
                renderTasks();
            }
        }
    );
}

function saveEditedTask(
    taskId,
    input
) {

    const newText =
        input.value.trim();

    if (!newText) {
        input.focus();

        input.setCustomValidity(
            "Task cannot be empty."
        );

        input.reportValidity();

        return;
    }

    if (newText.length > 500) {
        input.focus();

        input.setCustomValidity(
            "Task cannot exceed 500 characters."
        );

        input.reportValidity();

        return;
    }

    input.setCustomValidity("");

    const task =
        tasks.find(
            item => item.id === taskId
        );

    if (!task) {
        return;
    }

    task.text =
        newText;

    saveTasks();

    renderTasks();
}

function deleteTask(taskId) {

    const taskIndex =
        tasks.findIndex(
            task => task.id === taskId
        );

    if (taskIndex === -1) {
        return;
    }

    const taskCard =
        document.querySelector(
            `.task-card[data-task-id="${CSS.escape(taskId)}"]`
        );

    const shouldDelete =
        window.confirm(
            "Delete this task permanently?"
        );

    if (!shouldDelete) {
        return;
    }

    if (taskCard) {

        taskCard.classList.add(
            "task-removing"
        );

        setTimeout(() => {

            tasks.splice(
                taskIndex,
                1
            );

            saveTasks();

            renderTasks();

        }, 180);

        return;
    }

    tasks.splice(
        taskIndex,
        1
    );

    saveTasks();

    renderTasks();
}

function updateCounters(
    pendingTotal,
    completedTotal
) {

    pendingCount.textContent =
        `${pendingTotal} pending`;

    completedCount.textContent =
        `${completedTotal} completed`;

    const total =
        pendingTotal +
        completedTotal;

    totalTasks.textContent =
        `${total} ${
            total === 1
                ? "task"
                : "tasks"
        }`;
}

function updateEmptyStates(
    pendingTotal,
    completedTotal
) {

    pendingEmpty.hidden =
        pendingTotal !== 0;

    completedEmpty.hidden =
        completedTotal !== 0;
}

function formatDate(timestamp) {

    const date =
        new Date(timestamp);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown time";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}

function showInputError(
    message
) {
    inputError.textContent =
        message;
}

function clearInputError() {
    inputError.textContent =
        "";
}

taskInput.addEventListener(
    "input",
    () => {

        if (
            inputError.textContent
        ) {
            clearInputError();
        }
    }
);

window.addEventListener(
    "storage",
    (event) => {

        if (
            event.key !== STORAGE_KEY
        ) {
            return;
        }

        tasks =
            loadTasks();

        renderTasks();
    }
);