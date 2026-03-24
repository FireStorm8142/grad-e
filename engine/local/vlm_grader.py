import ollama
import json

from .prompts import LOCAL_MANAGER_PROMPT, LOCAL_TEXT_PROMPT, LOCAL_MATH_PROMPT, LOCAL_DIAGRAM_PROMPT

class LocalOllamaGrader:
    def __init__(self):
        self.model_name = "qwen3-vl:8b" 

    def _extract_json(self, text):
        try:
            clean_json = text[text.find("{"):text.rfind("}")+1]
            return json.loads(clean_json)
        except (json.JSONDecodeError, ValueError):
            return None

    def evaluate_answer(self, q_data, q_img_path, key_img_path, student_img_paths):
        """Orchestrates Manager -> Specialist workflow with dynamic Top-K image arrays."""
        
        print(f"\n👔 [MANAGER] Analyzing Q{q_data['id']} (Max Points: {q_data['max_points']}) via Ollama...")

        manager_messages = [
            {"role": "system", "content": LOCAL_MANAGER_PROMPT},
            {
                "role": "user", 
                "content": f"Image 1 is the Question. Image 2 is the Answer Key. Allocate the {q_data['max_points']} points to the required agents (text, math, diagram).",
                "images": [q_img_path, key_img_path] 
            }
        ]
        
        manager_response = ollama.chat(
            model=self.model_name, 
            messages=manager_messages,
            format="json", 
            keep_alive="5m" 
        )
        
        routing_plan = self._extract_json(manager_response['message']['content'])

        if not routing_plan or "agents" not in routing_plan:
            print("⚠️ [MANAGER ERROR] Defaulting to Math Agent.")
            routing_plan = {"agents": [{"type": "math", "points": q_data['max_points']}]}

        final_score = 0.0
        combined_feedback = []

        prompt_map = {
            "text": LOCAL_TEXT_PROMPT,
            "math": LOCAL_MATH_PROMPT,
            "diagram": LOCAL_DIAGRAM_PROMPT
        }

        total_agents = len(routing_plan["agents"])
        
        for idx, task in enumerate(routing_plan["agents"]):
            agent_type = task["type"]
            allocated_pts = task["points"]
            
            print(f"  --> 🕵️‍♂️ [{agent_type.upper()} AGENT] Evaluating student crop(s) for {allocated_pts} points...")
            
            specialist_messages = [
                {"role": "system", "content": prompt_map.get(agent_type, LOCAL_TEXT_PROMPT)},
                {
                    "role": "user", 
                    "content": f"Image 1 is the Reference Key. All subsequent images are the Student's Answer. The answer may span multiple pages. Grade the {agent_type} aspects out of {allocated_pts} points.",
                    # Injecting the single key + the dynamic array of student parts
                    "images": [key_img_path] + student_img_paths
                }
            ]
            
            keep_model_alive = "5m" if idx < (total_agents - 1) else 0

            agent_response = ollama.chat(
                model=self.model_name, 
                messages=specialist_messages,
                format="json",
                keep_alive=keep_model_alive 
            )
            
            agent_data = self._extract_json(agent_response['message']['content'])
            
            if agent_data:
                final_score += agent_data.get("awarded_marks", 0)
                combined_feedback.append(f"[{agent_type.upper()}]: {agent_data.get('feedback', '')}")

        return {
            "question_id": q_data["id"],
            "awarded_marks": min(final_score, q_data["max_points"]),
            "status": "correct" if final_score >= (q_data["max_points"] * 0.9) else "partial",
            "feedback": " | ".join(combined_feedback)
        }