
# WordOfTheDay

The place where all coomers learn more words 

---

## 🛠 Git Essentials

This guide will help you manage your files and contribute to the project.

### 1. Adding (Loading) Files
Before you "save" your work to the history, you need to tell Git which files to track.

* **Via Terminal:**
    ```bash
    git add <file_name>   # Add a specific file
    git add .             # Add all changes in the current folder
    ```
* **Via GitHub Web:** Navigate to the folder, click **Add file** > **Upload files**, and drag your files in.

### 2. Committing Changes
Committing is like creating a permanent "save point." 

1.  **Stage your files** (using the `add` command above).
2.  **Commit with a clear message:**
    ```bash
    git commit -m "Briefly explain what you changed"
    ```
    *Tip: Avoid messages like "fixed stuff." Be specific!*

3.  **Push to the cloud:**
    ```bash
    git push origin <your-branch-name>
    ```

### 3. Making a Pull Request (PR)
A PR is how you ask to merge your work into the main project.

1.  Push your branch to GitHub.
2.  Go to the repository on GitHub.com.
3.  Click the **"Compare & pull request"** button (usually appears in a yellow bar at the top).
4.  Write a short title and description of your changes.
5.  Click **Create pull request**.

---

## 🚦 Quick Workflow Checklist
1. `git pull` (Get latest updates)
2. `git checkout -b branch-name` (Create a new branch for your work)
3. *Do your work/Edit files*
4. `git add .`
5. `git commit -m "Your message"`
6. `git push origin branch-name`
7. Open the **Pull Request** on GitHub.
