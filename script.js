// Firebase Config (replace with your keys)
const firebaseConfig = {
    apiKey: "AIzaSyD5wMYRh4lIchJmY4UcfOcL6EjVwjb31uc",
    authDomain: "datashoe-breakdown-log.firebaseapp.com",
    projectId: "datashoe-breakdown-log",
    storageBucket: "datashoe-breakdown-log.firebasestorage.app",
    messagingSenderId: "50577264675",
    appId: "1:50577264675:web:1e017d8de04d3eb1c52196"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Submit Data
function submitData() {
    const date = document.getElementById('date').value;
    const technician = document.getElementById('technician').value;
    const machine = document.getElementById('machine').value;
    const factory = document.getElementById('factory').value;
    const time = document.getElementById('time').value;
    const sparePart = document.getElementById('sparePart').value;

    // Validate at least 4 fields
    const filledFields = [date, technician, machine, factory, time, sparePart]
        .filter(field => field.trim() !== '').length;

    if (filledFields < 4) {
        alert("Fill at least 4 fields!");
        return;
    }

    // Save to Firebase
    const entry = {
        date,
        technician,
        machine,
        factory,
        time,
        sparePart,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref(`factories/${factory}`).push(entry)
        .then(() => {
            alert("Data saved!");
            loadData();
        })
        .catch(error => alert("Error: " + error.message));
}

// Load and Display Data with Delete Button
function loadData() {
    database.ref('factories').on('value', (snapshot) => {
        let allData = [];
        snapshot.forEach(factorySnapshot => {
            const factoryName = factorySnapshot.key;
            factorySnapshot.forEach(entrySnapshot => {
                const entry = entrySnapshot.val();
                entry.key = entrySnapshot.key; // Unique Firebase ID
                entry.factory = factoryName; // Factory name
                allData.push(entry);
            });
        });
        allData.sort((a, b) => b.timestamp - a.timestamp);
        displayData(allData);
    });
}

// Display Data with Delete Button
function displayData(data) {
    const displayDiv = document.getElementById('dataDisplay');
    displayDiv.innerHTML = data.map(entry => `
        <div class="entry">
            <p><strong>Date:</strong> ${entry.date}</p>
            <p><strong>Technician:</strong> ${entry.technician}</p>
            <p><strong>Machine:</strong> ${entry.machine}</p>
            <p><strong>Factory:</strong> ${entry.factory}</p>
            ${entry.time ? `<p><strong>Time:</strong> ${entry.time}</p>` : ''}
            ${entry.sparePart ? `<p><strong>Spare Part:</strong> ${entry.sparePart}</p>` : ''}
            <button onclick="deleteEntry('${entry.factory}', '${entry.key}')">Delete</button>
        </div>
    `).join('');
}

// Delete Data
function deleteEntry(factory, key) {
    if (confirm("Are you sure you want to delete this entry?")) {
        database.ref(`factories/${factory}/${key}`).remove()
            .then(() => {
                alert("Entry deleted!");
                loadData(); // Refresh the list
            })
            .catch(error => alert("Error: " + error.message));
    }
}

// Search Function
function searchData() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    database.ref('factories').once('value', (snapshot) => {
        let results = [];
        snapshot.forEach(factorySnapshot => {
            factorySnapshot.forEach(entrySnapshot => {
                const entry = entrySnapshot.val();
                if (JSON.stringify(entry).toLowerCase().includes(query)) {
                    results.push(entry);
                }
            });
        });
        displayData(results.sort((a, b) => b.timestamp - a.timestamp));
    });
}

// Login/Logout
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => alert("Logged in for KPIs!"))
        .catch(error => alert("Error: " + error.message));
}

function logout() {
    auth.signOut().then(() => alert("Logged out!"));
}

// Load data on startup
window.onload = loadData;