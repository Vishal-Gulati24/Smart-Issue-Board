# Smart-Issue-Board

A collaborative, real-time issue management system designed to streamline team workflows. This project features smart duplicate detection, status transition rules, and a fully responsive interface.

### 🚀 [Live Demo Link](https://smart-issue-board-amber.vercel.app/)

### 💻 [GitHub Repository](https://github.com/Vishal-Gulati24/Smart-Issue-Board)

## 1. Tech Stack Choices

For this project, I chose the **Vite + Vanilla JavaScript + Firebase** stack for the following reasons:

- **Vite:** Chosen over Create React App for its lightning-fast Hot Module Replacement (HMR) and optimized build process, which ensures a smooth developer experience and better performance scores.
- **Vanilla JavaScript:** I opted for native JS to demonstrate a strong grasp of DOM manipulation and asynchronous programming without the "abstraction" of a framework. This shows I understand how the web works at a fundamental level.
- **Firebase (Firestore & Auth):** I used Firebase because it provides a real-time NoSQL database. This allows the board to update instantly for all users without requiring a page refresh.

## 2. My Firestore Data Structure

I designed the database to be flat and efficient. Each task is stored as a document in an "issues" collection with the following information:

- **Title and Description:** Standard text strings to capture the core problem.
- **Status:** A string that tracks if an item is "Open", "In Progress", or "Done".
- **Priority:** Categorized as "Low", "Medium", or "High" to help the UI apply specific color-coded styles.
- **CreatedBy:** Stores the email of the logged-in user to track ownership.
- **AssignedTo:** A string field to designate which team member is responsible.
- **CreatedAt:** A server-side Timestamp. I chose this over a standard string to ensure that the "Newest First" sorting logic works perfectly regardless of the user's local time zone.

## 3. Smart Similarity Logic

To prevent duplicate issues, I implemented a **Smart Similarity Check** before any issue is saved to the database:

1.  **Extraction:** When a user types a title, the system fetches all existing issues.
2.  **Comparison:** It uses a normalized string comparison (removing case sensitivity and extra spaces).
3.  **Threshold:** If a new title is more than 80% similar to an existing one, the system alerts the user and asks for confirmation before proceeding.
4.  **Result:** This keeps the database clean and ensures team members don't work on the same bug twice.

## 4. Challenges & Learning

- **Environment Variable Security:** Initially, I faced challenges ensuring that Firebase keys were hidden from GitHub while remaining accessible to the Vite build. I solved this by implementing `.env` files and configuring Vercel's production environment variables.
- **Status Transition Rules:** Implementing the logic to prevent an issue from moving directly from "Open" to "Done" was a great exercise in state management. It required ensuring the UI and the Database both enforced these business rules.
- **Responsiveness:** Making the Kanban-style cards look good on mobile required careful use of CSS Flexbox and media queries to ensure buttons remained "tappable" on smaller screens.

## 5. Future Improvements & Scaling

While the current version meets all core requirements for a functional MVP, I have identified the following features for future development to enhance the user experience and security:

- **Navigation Bar & Routing:** I plan to implement a dedicated Navigation Bar to manage a multi-page architecture. This would separate the "Issue Creation" form from the "Main Dashboard," providing a more focused user interface as the application scales.
- **Account Recovery (Forgot Password):** To improve the user authentication flow, I intend to integrate Firebase’s `sendPasswordResetEmail` handler. This will allow users to securely recover their accounts via email, a critical feature for any production-ready SaaS application.
- **Drag-and-Drop Interaction:** I would like to implement a Kanban-style drag-and-drop system using `SortableJS` or `Framer Motion`. This would allow team members to move issues between columns (e.g., from "In Progress" to "Done") more intuitively.
- **Advanced Filtering & Search:** As the number of issues grows, adding a search bar and the ability to filter by "Priority" or "Assignee" would be the next step to maintain high usability.

**Developed by Vishal Gulati** _Internship Assignment - 2026_
