import os
import json
import ollama
import fitz  # PyMuPDF

class LocalSetupManager:
    def __init__(self):
        # We can still use Qwen, but we are using its text-brain, not its vision-brain.
        self.model_name = "qwen3-vl:8b" 

    def _extract_text_from_pdf(self, pdf_path):
        """Uses the CPU to instantly rip embedded text from the PDF."""
        print(f"📄 [SETUP] Extracting raw text from {pdf_path} via CPU...")
        text_content = ""
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text_content += page.get_text("text") + "\n\n"
            doc.close()
            return text_content.strip()
        except Exception as e:
            print(f"❌ [ERROR] Could not read PDF: {e}")
            return ""

    def _extract_json(self, text):
        try:
            clean_json = text[text.find("["):text.rfind("]")+1]
            return json.loads(clean_json)
        except (json.JSONDecodeError, ValueError):
            return None

    def generate_questions_list(self, question_paper_pdf_path):
        """Uses Ollama to logically parse the CPU-extracted text into JSON."""
        
        # 1. CPU Phase: Instant Text Extraction
        raw_text = self._extract_text_from_pdf(question_paper_pdf_path)
        
        if not raw_text:
            print("❌ [SETUP ERROR] No text found in PDF. (Is it a scanned image?)")
            return []

        print(f"🧠 [SETUP] Passing {len(raw_text.split())} words to Ollama for JSON formatting...")

        # 2. GPU Phase: Logical Parsing (Pure Text, No Images)
        system_prompt = """You are an AI Data Structurer. 
        You will be provided with the raw, messy text extracted from a university exam paper.
        Extract every single question and format it into a JSON array.
        
        RULES:
        1. Identify the Question ID (e.g., '1', '2a', '7b').
        2. Transcribe the core text of the question.
        3. Identify the maximum marks/points allocated to that question.
        4. Output STRICTLY as a JSON array of objects.
        5. Ignore general instructions, headers, and title pages.
        
        EXPECTED JSON SCHEMA:
        [
            {"id": "1", "context": "Define Time Complexity.", "max_points": 2.0}
        ]"""

        # Notice: No "images" array in the payload. Just pure text.
        response = ollama.chat(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user", 
                    "content": f"Here is the raw exam text:\n\n{raw_text}"
                }
            ],
            format="json",
            options={
                "num_ctx": 8192 # Safe to keep at 8K just in case the text is long
            }
        )

        # 3. Parse and Return
        questions_list = self._extract_json(response['message']['content'])
        
        if questions_list:
            print(f"✅ [SETUP SUCCESS] Extracted {len(questions_list)} total questions.")
            return questions_list
        else:
            print("❌ [SETUP ERROR] Failed to format JSON.")
            return []