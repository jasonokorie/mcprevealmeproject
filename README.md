 Project Name
“Self-Updating User Bio via Chat”

✅ Goal (one-sentence)
Build a simple agentic system that learns about a user through conversation, stores those facts, and automatically updates a short "About Me" bio over time.

✅ Why do this?
Direct, minimal implementation of the Model Context Protocol pattern:

Memory = persistent user facts

Context = recent chat + memory

Protocol = logic for updating memory & bio

Forces thinking about how to structure memory, build context windows, and define update rules.

Easy to finish in 2–3 days max, so you can quickly get back to core RevealMe work.

Teaches concepts immediately transferable to your real user-persona graph project.

✅ Features / User Story
As a user, I can chat with an AI that remembers personal facts I share. When I mention new details, it updates my “About Me” bio to reflect who I am.

✅ Core Components (MCP breakdown)
1️⃣ Memory
Persistent user profile stored in a simple database or JSON file.

Example schema:

json
Copy
Edit
{
  "name": "Jason",
  "location": "Austin, TX",
  "interests": ["photography", "tennis"]
}
Stores facts extracted from conversation.

Persistence: must survive restarts.

2️⃣ Context
At runtime, combine:

Last N chat messages (e.g., 3–5)

Current Memory (facts)

Current Bio (if you want it in context)

Used to prompt the LLM:

“Given what the user just said, and what we already know, should we update their bio or memory?”

3️⃣ Protocol
Define rules for when and how to update:

Always try to extract new facts from recent chat.

If new facts are found, add them to memory.

Always propose a new “About Me” bio.

Optionally let the user approve changes before saving.

✅ User Flow Example
User: “Hey, I just moved to Austin!”

System:

Sees last memory → location: ""

Context includes last chat and existing facts

LLM detects: new location = Austin

System updates memory:

json
Copy
Edit
{
  "location": "Austin"
}
System updates bio:

"Hi! I'm Jason, now living in Austin, who loves photography and tennis."

✅ Suggested LLM Prompt Design
You can use something like:

swift
Copy
Edit
You are an assistant maintaining a user's self-bio.
Here is the current memory: {memory}
Here is their current bio: {bio}
Here is their recent chat: {chat}

1. Extract any new personal facts.
2. Suggest an updated memory object in JSON.
3. Suggest a new 2–3 sentence bio incorporating the memory.
✅ Example Input/Output
Input
makefile
Copy
Edit
Memory:
{
  "name": "Jason",
  "location": "",
  "interests": ["photography"]
}

Chat:
"Yeah, I just moved to Austin, and I've been getting into tennis."
Expected LLM Output
css
Copy
Edit
Updated Memory:
{
  "name": "Jason",
  "location": "Austin",
  "interests": ["photography", "tennis"]
}

Updated Bio:
"Hi, I'm Jason! I recently moved to Austin and love photography and tennis."
✅ Technical Spec / MVP Scope
Tech Stack
Backend: Node.js/Express or FastAPI

Frontend: Minimal React chat interface or CLI

LLM: OpenAI GPT (e.g. gpt-4o-mini)

Storage: JSON file or SQLite

Required endpoints (example)
POST /chat

Input: user message

Process: MCP pipeline

Output: AI response + updated bio

GET /memory

Returns current memory + bio

Suggested File Structure
bash
Copy
Edit
/project-root
  /backend
    app.py / index.js
    memory_store.json
  /frontend
    ChatUI.jsx
Persistence
Memory store in memory_store.json:

json
Copy
Edit
{
  "bio": "I'm Jason...",
  "facts": {
    "name": "Jason",
    "location": "Austin",
    "interests": ["photography", "tennis"]
  }
}
✅ Stretch Goals (Optional)
Add a "confidence" score per fact.

Log all memory changes for transparency.

Let user approve memory/bio updates.

Add multi-user support with separate memories.

✅ Time Estimate
Task	Est. Time
Set up project	2–4 hours
Build Memory store	2–3 hours
Chat API + LLM prompt	4–6 hours
Basic Frontend/CLI	2–4 hours
Polish & test	2–4 hours
Total	~2–3 days max

✅ Deliverable
A simple app that:

Stores personal facts.

References those facts in conversation.

Automatically proposes updated “About Me” bios over time.
