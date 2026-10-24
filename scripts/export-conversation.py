#!/usr/bin/env python3
import json
import re
import os
import shutil
from datetime import datetime

CONVERSATION_ID = "e09fbaaa-71f6-4177-b164-2c02dce92f35"
BRAIN_DIR = f"/Users/tranquocdung/.gemini/antigravity-ide/brain/{CONVERSATION_ID}"
LOGS_DIR = os.path.join(BRAIN_DIR, ".system_generated/logs")
TRANSCRIPT_PATH = os.path.join(LOGS_DIR, "transcript_full.jsonl")
if not os.path.exists(TRANSCRIPT_PATH):
    TRANSCRIPT_PATH = os.path.join(LOGS_DIR, "transcript.jsonl")

OUTPUT_DIR = "/Users/tranquocdung/Projects/papaya-asign/conversations"
os.makedirs(OUTPUT_DIR, exist_ok=True)

MD_OUTPUT_PATH = os.path.join(OUTPUT_DIR, f"{CONVERSATION_ID}.md")
RAW_OUTPUT_PATH = os.path.join(OUTPUT_DIR, f"{CONVERSATION_ID}.jsonl")
LATEST_SYMLINK = os.path.join(OUTPUT_DIR, "LATEST_CONVERSATION.md")

print(f"Reading from {TRANSCRIPT_PATH}...")

def extract_user_request(raw_content):
    if not raw_content:
        return ""
    # Look for <USER_REQUEST>...</USER_REQUEST>
    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", raw_content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return raw_content.strip()

turns = []
current_turn = None

with open(TRANSCRIPT_PATH, "r", encoding="utf-8") as f:
    for line in f:
        try:
            item = json.loads(line)
        except Exception:
            continue
        
        step_type = item.get("type")
        source = item.get("source")
        created_at = item.get("created_at", "")
        content = item.get("content", "")
        tool_calls = item.get("tool_calls", [])

        if step_type == "USER_INPUT":
            if current_turn:
                turns.append(current_turn)
            user_prompt = extract_user_request(content)
            current_turn = {
                "turn_index": len(turns) + 1,
                "timestamp": created_at,
                "user_prompt": user_prompt,
                "tools": [],
                "assistant_response": ""
            }
        elif current_turn is not None:
            # Check for tool calls or execution steps
            if tool_calls:
                for tc in tool_calls:
                    fn = tc.get("function", {})
                    name = fn.get("name", "tool")
                    current_turn["tools"].append(name)
            elif step_type in ["RUN_COMMAND", "WRITE_FILE", "REPLACE_FILE_CONTENT", "VIEW_FILE", "GREP_SEARCH", "LIST_DIRECTORY"]:
                tool_summary = item.get("toolSummary") or step_type
                current_turn["tools"].append(str(tool_summary))
            
            # Assistant final response
            if step_type == "PLANNER_RESPONSE" and content:
                current_turn["assistant_response"] = content

if current_turn:
    turns.append(current_turn)

print(f"Parsed {len(turns)} conversation turns.")

# Write Markdown
with open(MD_OUTPUT_PATH, "w", encoding="utf-8") as out:
    out.write(f"# Papaya Claims Workstation - Full Conversation History\n\n")
    out.write(f"- **Conversation ID:** `{CONVERSATION_ID}`\n")
    out.write(f"- **Total Turns:** {len(turns)}\n")
    out.write(f"- **Exported At:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    out.write(f"- **Workspace:** `/Users/tranquocdung/Projects/papaya-asign`\n\n")
    out.write("---\n\n")

    for t in turns:
        out.write(f"## Turn {t['turn_index']} · `{t['timestamp']}`\n\n")
        out.write(f"### 👤 Người Dùng (User)\n\n")
        out.write(f"{t['user_prompt']}\n\n")

        if t["tools"]:
            tool_unique = []
            for tool in t["tools"]:
                if tool not in tool_unique:
                    tool_unique.append(tool)
            out.write(f"> 🛠️ **Công cụ & Thao tác đã thực hiện:** {', '.join(f'`{t}`' for t in tool_unique[:10])}\n\n")

        if t["assistant_response"]:
            out.write(f"### 🤖 Trợ Lý Antigravity (Assistant)\n\n")
            out.write(f"{t['assistant_response']}\n\n")
        
        out.write("---\n\n")

print(f"Exported Markdown to: {MD_OUTPUT_PATH}")

# Copy raw JSONL
print(f"Copying raw JSONL to: {RAW_OUTPUT_PATH}...")
shutil.copyfile(TRANSCRIPT_PATH, RAW_OUTPUT_PATH)

# Create/Update LATEST_CONVERSATION.md symlink / copy
shutil.copyfile(MD_OUTPUT_PATH, LATEST_SYMLINK)
print("Done!")
