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

document.getElementById("loginBtn").onclick = () =>
  signInWithEmailAndPassword(auth, email.value, password.value).catch((err) =>
    alert(err.message)
  );
document.getElementById("signupBtn").onclick = () =>
  createUserWithEmailAndPassword(auth, email.value, password.value).catch(
    (err) => alert(err.message)
  );
document.getElementById("logoutBtn").onclick = () => signOut(auth);

async function checkSimilarity(newTitle) {
  const snap = await getDocs(collection(db, "issues"));
  let exists = false;
  snap.forEach((d) => {
    if (d.data().title.toLowerCase().trim() === newTitle.toLowerCase().trim()) {
      exists = true;
    }
  });
  if (exists) {
    return confirm(
      "Smart Hint: A similar issue already exists. Create anyway?"
    );
  }
  return true;
}

document.getElementById("submitIssue").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("desc").value.trim();
  const priority = document.getElementById("priority").value;
  const assignedTo = document.getElementById("assignee").value;

  if (!title) return alert("Title is required");

  const proceed = await checkSimilarity(title);
  if (!proceed) return;

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
};

function loadIssues() {
  const filter = document.getElementById("filterStatus").value;
  let q = query(collection(db, "issues"), orderBy("createdAt", "desc"));

  if (filter !== "All") {
    q = query(
      collection(db, "issues"),
      where("status", "==", filter),
      orderBy("createdAt", "desc")
    );
  }

  onSnapshot(q, (snapshot) => {
    const list = document.getElementById("issueList");
    list.innerHTML = "";
    snapshot.forEach((d) => {
      const issue = d.data();
      const card = document.createElement("div");
      card.className = `card priority-${issue.priority}`;
      card.innerHTML = `
                <h3>${issue.title}</h3>
                <p>${issue.description}</p>
                <div class="meta"><b>Status:</b> ${issue.status} | <b>Priority:</b> ${issue.priority}</div>
                <div class="meta"><b>Assigned:</b> ${issue.assignedTo}</div>
                <div class="actions">
                    <button onclick="updateStatus('${d.id}', '${issue.status}', 'In Progress')">Work</button>
                    <button onclick="updateStatus('${d.id}', '${issue.status}', 'Done')">Done</button>
                </div>
            `;
      list.appendChild(card);
    });
  });
}

window.updateStatus = async (id, current, next) => {
  if (current === "Open" && next === "Done") {
    alert(
      "Rule: You must move the issue to 'In Progress' before marking it as 'Done'."
    );
    return;
  }
  await updateDoc(doc(db, "issues", id), { status: next });
};

document.getElementById("filterStatus").onchange = loadIssues;
