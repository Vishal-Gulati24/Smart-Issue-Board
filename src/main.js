import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const userEmailDisplay = document.getElementById("userEmail");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    userEmailDisplay.innerText = user.email;
    loadIssues();
  } else {
    authSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
  }
});

document.getElementById("loginBtn").onclick = (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).catch(
    (err) => alert(err.message)
  );
};

document.getElementById("signupBtn").onclick = (e) => {
  e.preventDefault();
  createUserWithEmailAndPassword(
    auth,
    emailInput.value,
    passwordInput.value
  ).catch((err) => alert(err.message));
};

document.getElementById("logoutBtn").onclick = () => signOut(auth);

async function checkSimilarity(newTitle) {
  const snap = await getDocs(collection(db, "issues"));
  let exists = false;
  snap.forEach((d) => {
    if (d.data().title.toLowerCase().trim() === newTitle.toLowerCase().trim())
      exists = true;
  });
  return exists ? confirm("A similar issue exists. Create anyway?") : true;
}

document.getElementById("submitIssue").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("desc").value.trim();
  const priority = document.getElementById("priority").value;
  const assignedTo = document.getElementById("assignee").value.trim();

  if (!title || !description || !assignedTo) {
    return alert(
      "Error: Title, Description, and Assignee are all required to submit an issue."
    );
  }

  const proceed = await checkSimilarity(title);
  if (!proceed) return;

  try {
    await addDoc(collection(db, "issues"), {
      title,
      description,
      priority,
      assignedTo,
      status: "Open",
      createdBy: auth.currentUser.email,
      createdAt: serverTimestamp(),
    });

    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("assignee").value = "";
    document.getElementById("priority").value = "Low";

    alert("Issue submitted successfully!");
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to submit issue. Please try again.");
  }
};

function loadIssues() {
  const filter = document.getElementById("filterStatus").value;
  let q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
  if (filter !== "All")
    q = query(
      collection(db, "issues"),
      where("status", "==", filter),
      orderBy("createdAt", "desc")
    );

  onSnapshot(q, (snapshot) => {
    const list = document.getElementById("issueList");
    list.innerHTML = "";
    snapshot.forEach((d) => {
      const issue = d.data();

      const time = issue.createdAt
        ? new Date(issue.createdAt.seconds * 1000).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Just now";

      const card = document.createElement("div");
      card.className = `card priority-${issue.priority}`;
      card.innerHTML = `
                <h3>${issue.title}</h3>
                <p>${issue.description}</p>
                <hr>
                <div class="meta">
                    <b>Status:</b> ${issue.status}
                </div>
                <div class="meta">
                    <b>Priority:</b> ${issue.priority}
                </div>
                <div class="meta">
                    <b>Assigned To:</b> ${issue.assignedTo}
                </div>
                <div class="meta">
                    <b>Created By:</b> ${issue.createdBy}
                </div>
                <div class="meta">
                    <b>Created At:</b> ${time}
                </div>
                <div class="actions">
                    <button onclick="updateStatus('${d.id}', '${issue.status}', 'In Progress')">Work</button>
                    <button onclick="updateStatus('${d.id}', '${issue.status}', 'Done')">Done</button>
                </div>`;
      list.appendChild(card);
    });
  });
}

window.updateStatus = async (id, current, next) => {
  if (current === "Open" && next === "Done")
    return alert("Rule: Move to 'In Progress' first!");
  await updateDoc(doc(db, "issues", id), { status: next });
};

document.getElementById("filterStatus").onchange = loadIssues;
