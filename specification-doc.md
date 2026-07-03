Project: "The Well" - A Catholic Bible Study Companion
Project Overview
"The Well" is a personal Bible study web application built with React and powered by an Antigravity/Firebase backend. It is designed for daily Scripture engagement, specifically tailored for a Catholic user following the annual Fr. Mike Schmitz "Bible in a Year" podcast. The app prioritizes cyclic, chronological study, allowing the user to anchor notes to Scripture coordinates rather than dates, building a lifelong web of personal theological commentary.

Core Features & Architecture
1. Scripture Integration

• Catholic Canon: The application must incorporate all 73 books of the Catholic Bible.

• Reader Interface: A clean, focused reading interface where the user can select any book and chapter.

• Search & Navigation: Intuitive navigation between the Old and New Testaments, including the Deuterocanonical books.

2. Note-Taking & Linking

• Verse-Anchored Notes: Notes are tied explicitly to specific Book, Chapter, and Verse coordinates (e.g., GEN.1.1).

• Historical Stacking: When viewing a chapter, the user can see a chronological stack of all their notes from previous years' readings, with an option to add a new entry for the current year.

• Entity Wiki: A feature allowing users to create profiles and take rich notes on People and Events mentioned in the text, creating backlinks to all associated verses.

• Theme Tagging: A system to tag verses and notes with broader spiritual themes (e.g., "Covenant," "Grace"), allowing for a dedicated theme dashboard.

3. Podcast & Reading Plan Integration

• Bible in a Year Plan: Integrate the Fr. Mike Schmitz "Bible in a Year" podcast reading structure.

• Daily Tagging: Allow the user to tag verses and notes with the specific podcast day number (1–365), accounting for the non-linear daily reading assignments and supplemental Psalms/Proverbs.

Suggested Development Phases
Phase 1: The MVP (Minimum Viable Product)

• Initialize the React application and set up the Firebase authentication and Firestore database.

• Integrate a Catholic Bible API or public-domain text and build the Book/Chapter reader interface.

• Implement the basic text box to save a note anchored to a specific verse.

• Display past notes chronologically on the reading view.

Phase 2: The Wiki & Tagging System

• Add the data schema and UI to create and manage personal profiles for People and Events.

• Implement the ability to highlight Scripture and link it directly to these entities.

• Build the "Theme" tagging system to categorize notes and explore them via a central theme dashboard.

Phase 3: The Podcast Alignment

• Integrate the Fr. Mike Schmitz reading sequence metadata.

• Allow the user to tag Scripture and notes with the exact "Day" of the podcast.

• Provide a summary view of the year's progress tied to the 365-day journey.
