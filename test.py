# test_setup.py
import json
import os
from engine.local.setup_manager import LocalSetupManager

def run_setup_test():
    qp_pdf = "engine/storage/uploads/Algorithm paper.pdf"
    
    if not os.path.exists(qp_pdf):
        print(f"❌ Error: Could not find {qp_pdf}")
        print("Please copy your Algorithm paper PDF to this location.")
        return

    print("🚀 Initiating Local Setup Manager test...")
    setup_manager = LocalSetupManager()
    
    # This triggers the PDF to Image conversion, then calls Ollama
    questions_list = setup_manager.generate_questions_list(qp_pdf)
    
    if questions_list:
        print("\n✅ Successfully Extracted Exam Schema:")
        print(json.dumps(questions_list, indent=4))
    else:
        print("\n❌ Failed to extract questions. Check Ollama logs.")

if __name__ == "__main__":
    run_setup_test()